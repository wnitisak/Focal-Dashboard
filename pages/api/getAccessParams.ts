process.env.TZ = "Asia/Bangkok"
import { AssumeRoleCommand, STSClient } from '@aws-sdk/client-sts';
import { NextApiRequest, NextApiResponse } from "next";


export default async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const stsclient = new STSClient({
            region: 'ap-southeast-1',
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
            }
        });
        const command = new AssumeRoleCommand({
            RoleArn: process.env.AWS_ASSUME_ROLE_ARN,
            RoleSessionName: 'temp-token',
        });
        const response = await stsclient.send(command);
        const data = await response;
        if (data?.Credentials) {
            const credentials = {
                accessKeyId: data.Credentials.AccessKeyId || '',
                secretAccessKey: data.Credentials.SecretAccessKey || '',
                sessionToken: data.Credentials.SessionToken || '',
                region: 'ap-southeast-1',
            };
            return res.status(200).json({ resCode: '200', credentials })
        } else {
            return res.status(200).json({ resCode: 'E0' })
        }
    }
    catch (err) {
        return res.status(500).json({})
    }
}