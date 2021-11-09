import jwt from "jsonwebtoken";
import { User } from "../entities/User";

require("dotenv").config();

const secret: string = <string>process.env.JWT_TOKEN_SECRET;

export function generateToken(user: User): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        jwt.sign({
            id: user.id
        }, secret, {
            algorithm: "HS512",
            expiresIn: "12h"
        }, (err: Error | null, encoded: string | undefined) => {
            if (err) return reject(err);
            if (!encoded) return reject("Failed to generate JWT token, `encoded` came back as undefined");
            return resolve(encoded);
        });
    });
}