import dotenv from "dotenv";
import { GoogleCallbackRequest } from "express";
import { GaxiosError } from "gaxios";
import { google, oauth2_v2 } from "googleapis";
import { Get, InternalServerError, JsonController, Req } from "routing-controllers";
import { Service } from "typedi";
import { InjectRepository } from "typeorm-typedi-extensions";
import { User } from "../entities/User";
import { getLogger } from "../logger";
import { UserRepository } from "../repositories/UserRepository";
import { getUserInfo } from "../utils/google";
import { generateToken } from "../utils/jwt";

dotenv.config();

interface BaseResponse {
    success: boolean;
}

interface AuthResponse extends BaseResponse {
    success: true;
    url: string;
}

interface CallbackResponse extends BaseResponse {
    success: true;
    token: string;
}

@JsonController("/api/google")
@Service()
export class GoogleController {
    static OAUTH = new google.auth.OAuth2(
        <string>process.env.GOOGLE_CLIENT_ID,
        <string>process.env.GOOGLE_CLIENT_SECRET,
        "http://localhost:3000/api/google/callback" // TODO: Change value in production; don't hardcode
    );

    constructor(@InjectRepository(User) private readonly userRepository: UserRepository) {

    }

    @Get("/auth")
    getAuth(): AuthResponse {
        const url: string = GoogleController.OAUTH.generateAuthUrl({
            access_type: "offline",
            hd: "2u.com",
            prompt: "consent",
            scope: [
                "https://www.googleapis.com/auth/userinfo.email",
                "https://www.googleapis.com/auth/userinfo.profile"
            ]
        });

        return {
            success: true,
            url
        };
    }

    @Get("/callback")
    async getCallback(@Req() req: GoogleCallbackRequest): Promise<CallbackResponse> {
        try {
            const { tokens } = await GoogleController.OAUTH.getToken(req.query.code);
            GoogleController.OAUTH.setCredentials(tokens);

            const userInfo = google.oauth2({
                auth: GoogleController.OAUTH,
                version: "v2"
            }).userinfo;

            const resUser: oauth2_v2.Schema$Userinfo = await getUserInfo(userInfo);

            const retUser: User = await this.userRepository.findOneOrInsert({
                googleId: resUser.id!
            }, {
                firstName: resUser.given_name ?? undefined,
                lastName: resUser.family_name ?? undefined,
                emailAddress: resUser.email!,
                googleId: resUser.id!
            });

            // Generate a JWT token for the user and return it to the client
            const token: string = await generateToken(retUser);

            return {
                success: true,
                token
            };
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