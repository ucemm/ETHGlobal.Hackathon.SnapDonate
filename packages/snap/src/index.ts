import type { OnRpcRequestHandler, OnCronjobHandler } from '@metamask/snaps-types';
import { panel, text, image, heading } from '@metamask/snaps-ui';

/**
 * Handle incoming JSON-RPC requests, sent through `wallet_invokeSnap`.
 *
 * @param args - The request handler args as object.
 * @param args.origin - The origin of the request, e.g., the website that
 * invoked the snap.
 * @param args.request - A validated JSON-RPC request object.
 * @returns The result of `snap_dialog`.
 * @throws If the request method is not valid for this snap.
 */
import QRCode from 'qrcode'; // Import QR Code library
//import { QRCode } from "react-qr-svg";

export const onRpcRequest: OnRpcRequestHandler = async ({ origin, request }) => {
  switch (request.method) {
    case 'hello':
      const ethUrl = "ethereum:0x53Dc0c92380cce50e0C3D9DF625478C3d4069bf3@11155111?value=1e20"
      try {
        const qrCodeDataUri = await QRCode.toString(ethUrl, { type: 'svg' });
        return snap.request({
          method: 'snap_dialog',
          params: {
            type: 'alert',
            content: panel([
              heading('Ready to impact lives and biodiversity? 🌳'),
              text('Scan this QR code to donate 1% of your recent 1 ETH transaction.'),
              text('Support 🏛️ UNICEF’s Venture Fund in their work towards climate action, ' +
              'zero hunger, and other Sustainable Development Goals.'),
              image(qrCodeDataUri),
            ]),
          },
        });
      } catch (err) {
        throw err;
        //throw new Error('Failed to generate QR Code.');
      
      }
      break;
    default:
      throw new Error('Method not found.');
  }
};

export const onCronjob: OnCronjobHandler = async ({ request }) => {
  switch (request.method) {
    case 'etherChecker':
      console.log('checking...')
      let accounts:any = await ethereum.request({
        "method": "eth_requestAccounts",
        "params": []
      });
      const account = accounts[0];
      const balance:any = await ethereum.request({method: 'eth_getBalance', params: [account, 'latest']})
      const parsedBalance:any = BigInt(balance)

      const persistedData:any = await snap.request({
        method: 'snap_manageState',
        params: { operation: 'get' },
      });

      if(persistedData){
        if(persistedData.account===account){

          const persistedBalance:any = BigInt(persistedData.balance)
          if(persistedBalance<parsedBalance && (parsedBalance-persistedBalance)>=BigInt(Math.pow(10, 18))){
            const diff:any = parsedBalance-persistedBalance
            const diff_eth:any = Number(diff)/Math.pow(10, 18);
            const onePercentOfDifference = diff * BigInt(1) / BigInt(100);
            const floatValueInExponentialFormat = Number(onePercentOfDifference).toExponential();
            const floatValueInExponentialFormatted = floatValueInExponentialFormat.replace(/e\+/g, 'e');

            const ethUrl = `ethereum:0x53Dc0c92380cce50e0C3D9DF625478C3d4069bf3@11155111?value=${floatValueInExponentialFormatted}`
            try {
              const qrCodeDataUri = await QRCode.toString(ethUrl, { type: 'svg' });
              await snap.request({
                method: 'snap_dialog',
                params: {
                  type: 'alert',
                  content: panel([
                    heading('Ready to impact lives and biodiversity?'),
                    text(`Scan this QR code to donate 1% of your recent transactions of ${diff_eth.toString()} ETH.`),
                    text('Support UNICEF’s Venture Fund in their work towards climate action, ' +
                    'zero hunger, and other Sustainable Development Goals.'),
                    image(qrCodeDataUri),
                  ]),
                },
              });
            } catch (err) {
              throw err;
              //throw new Error('Failed to generate QR Code.');
            
            }
          }
        }
      }

      await snap.request({
        method: 'snap_manageState',
        params: { operation: 'update', newState: {  account: account,
                                                    balance: balance} },
      });

      console.log({
        account:account,
        balance:balance
      })

      break;
      

    default:
      throw new Error('Method not found.');
  }
};