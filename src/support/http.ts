import { Request, Response } from "express";

export const failedResponse =(res:Response, statusCode: number, message:string = "Failed", success:boolean =false, data:any=null)=>{
    return res.status(statusCode).json({ success: success, message: message });
};
export const successResponse = (res: Response, statusCode: number, message: string = "Success", data: any = null, success: boolean = true) => {
    return res.status(statusCode).json({ success: success, message: message, data: data });
  };

import https from 'https';

export function initiatePaystack(metadata: Array<object>, email: string, totalAmount: number): Promise<any> {
    const params = JSON.stringify({
        "email": email,
        "amount": totalAmount.toString(),
        "metadata": metadata,
        "reference":`GOTRU_${Date.now()}`,
    });

    const options = {
        hostname: 'api.paystack.co',
        port: 443,
        path: '/transaction/initialize',
        method: 'POST',
        headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
            'Content-Type': 'application/json'
        }
    };

    return new Promise((resolve, reject) => {
        const req = https.request(options, res => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (error) {
                    reject(error);
                }
            });
        }).on('error', error => {
            reject(error);
        });

        req.write(params);
        req.end();
    });
}

export async function createPaystackSubAccount(payload:object): Promise<any>{
    
    // const params = JSON.stringify(payload)
    const params = JSON.stringify({
        "business_name": "Sunshine Studios",
        "settlement_bank": "C03", 
        "account_number": "7025065702", 
        "percentage_charge": 18.2 
      })
    
    const options = {
        hostname: 'api.paystack.co',
        port: 443,
        path: '/subaccount',
        method: 'POST',
        headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
            'Content-Type': 'application/json'
        }
    };
    
    return new Promise((resolve, reject) => {
        
        const req = https.request(options, res => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (error) {
                    reject(error);
                }
            });
        }).on('error', error => {
            reject(error);
        });

        req.write(params);
        req.end();
    });
};

export async function splitPaymentToSubAccount(payload:any): Promise<any>{
    
    const params = JSON.stringify(payload);
    // JSON.stringify({
    //     "email": payload.email,
    //     "amount": payload.amount,
    //     "subaccount": payload.sub_acc,
    //     "metadata": payload.metadata,
    //     "bearer": "subaccount",
    //     "transaction_charge": 0

    //   })
      
      const options = {
        hostname: 'api.paystack.co',
        port: 443,
        path: '/transaction/initialize',
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
    }
      
    
    return new Promise((resolve, reject) => {
        const req = https.request(options, res => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (error) {
                    reject(error);
                }
            });
        }).on('error', error => {
            reject(error);
        });

        req.write(params);
        req.end();
    });
}

