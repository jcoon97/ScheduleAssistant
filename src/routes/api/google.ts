import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import dotenv from "dotenv";
import { GoogleCallbackRequest, Response, Router } from "express";
import { google } from "googleapis";
import { getLogger } from "../../logger";

dotenv.config();

const router: Router = Router();

const googleAuth = new google.auth.OAuth2(
    <string>process.env.GOOGLE_CLIENT_ID,
    <string>process.env.GOOGLE_CLIENT_SECRET,
    "http://localhost:3000/api/google/callback" // TODO: Don't hardcode value
);

/**
 * Get an OAuth URL from Google and send it back to the user
 */
router.get("/auth", (_, res: Response): void => {
    const url: string = googleAuth.generateAuthUrl({
        access_type: "offline",
        hd: "2u.com",
        prompt: "consent",
        scope: [
            "https://www.googleapis.com/auth/userinfo.email",
            "https://www.googleapis.com/auth/userinfo.profile"
        ]
    });

    res.json({
        success: true,
        url
    });
});

/*
* Process authorization token from Google in this callback route, e.g. grabbing user
* information and storing to database, creating a JWT token, etc.
*/
router.get("/callback", async (req: GoogleCallbackRequest, res: Response): Promise<void> => {
    const { tokens } = await googleAuth.getToken(req.query.code);
    const userInfoUrl: string = `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${ tokens.access_token }`;
    const requestConfig: AxiosRequestConfig = {
        headers: {
            Authorization: `Bearer ${ tokens.id_token }`
        }
    };

    const googleUser = await axios.get(userInfoUrl, requestConfig)
        .then((res: AxiosResponse) => res.data)
        .catch(err => getLogger().error(err));

    res.json({
        success: true,
        userInfo: googleUser
    });
});

export default router;