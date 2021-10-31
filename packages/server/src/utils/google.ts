import { GaxiosResponse } from "gaxios";
import { oauth2_v2 } from "googleapis";
import { InternalServerError } from "routing-controllers";

export const getUserInfo = async (userInfo: oauth2_v2.Resource$Userinfo): Promise<oauth2_v2.Schema$Userinfo> => {
    return new Promise<oauth2_v2.Schema$Userinfo>((resolve, reject) => {
        userInfo.get((err: Error | null, resUser: GaxiosResponse<oauth2_v2.Schema$Userinfo> | null | undefined) => {
            if (err) return reject(err);

            if (!resUser?.data?.id) {
                throw new InternalServerError("UserInfo returned from Google was either null or undefined, or ID was unable to be extracted");
            }

            resolve(resUser.data);
        });
    });
};