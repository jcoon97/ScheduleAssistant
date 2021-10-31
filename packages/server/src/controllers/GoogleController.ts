import dotenv from "dotenv";
import { GoogleCallbackRequest, Response } from "express";
import { GaxiosError } from "gaxios";
import { google, oauth2_v2 } from "googleapis";
import { Get, InternalServerError, JsonController, Req, Res } from "routing-controllers";
import { Service } from "typedi";
import { Repository } from "typeorm";
import { InjectRepository } from "typeorm-typedi-extensions";
import User from "../entities/User";
import { getLogger } from "../logger";
import { getUserInfo } from "../utils/google";
import { generateToken } from "../utils/jwt";

dotenv.config();

@JsonController("/api/google")
@Service()
export class GoogleController {
    static OAUTH = new google.auth.OAuth2(
        <string>process.env.GOOGLE_CLIENT_ID,
        <string>process.env.GOOGLE_CLIENT_SECRET,
        "http://localhost:3000/api/google/callback" // TODO: Change value in production; don't hardcode
    );

    constructor(@InjectRepository(User) private readonly userRepository: Repository<User>) {

    }

    @Get("/auth")
    getAuth(@Res() res: Response): Response {
        const url: string = GoogleController.OAUTH.generateAuthUrl({
            access_type: "offline",
            hd: "2u.com",
            prompt: "consent",
            scope: [
                "https://www.googleapis.com/auth/userinfo.email",
                "https://www.googleapis.com/auth/userinfo.profile"
            ]
        });

        return res.json({
            success: true,
            url
        });
    }

    @Get("/callback")
    async getCallback(@Req() req: GoogleCallbackRequest, @Res() res: Response): Promise<Response> {
        try {
            const { tokens } = await GoogleController.OAUTH.getToken(req.query.code);
            GoogleController.OAUTH.setCredentials(tokens);

            const userInfo = google.oauth2({
                auth: GoogleController.OAUTH,
                version: "v2"
            }).userinfo;

            const resUser: oauth2_v2.Schema$Userinfo = await getUserInfo(userInfo);
            let retUser: User; // `User` object that will be used when generating JWT token
            const foundUser: User | undefined = await this.userRepository.findOne({ googleId: resUser.id! });

            if (foundUser) {
                retUser = foundUser;
            } else {
                const newUser: User = new User();
                newUser.firstName = resUser.given_name!; // TODO: May be undefined or null
                newUser.lastName = resUser.family_name!; // TODO: May be undefined or null
                newUser.emailAddress = resUser.email!;
                newUser.googleId = resUser.id!;
                retUser = await this.userRepository.save(newUser);
            }

            // Generate a JWT token for the user and return it to the client
            const token: string = await generateToken(retUser);

            return res.json({
                success: true,
                token
            });
        } catch (err) {
            getLogger().error(err);

            if (err instanceof GaxiosError) {
                if ((<GaxiosError>err).message === "invalid_grant") {
                    throw new InternalServerError("Invalid Grant. Token may have already been used. Re-generate an auth URL and try again.");
                }
            }
            throw new InternalServerError("An internal server error occurred. Please try again later.");
        }
    }
}