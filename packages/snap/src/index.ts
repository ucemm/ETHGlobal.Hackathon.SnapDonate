import type { OnRpcRequestHandler } from '@metamask/snaps-types';
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
              heading('Ready to impact lives and biodiversity?'),
              text('Scan this QR code to donate 1% of your recent 1 ETH transaction.'),
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
      break;
    default:
      throw new Error('Method not found.');
  }
};

/*
export const onRpcRequest: OnRpcRequestHandler = ({ origin, request }) => {
  switch (request.method) {
    case 'hello':
      return snap.request({
        method: 'snap_dialog',
        params: {
          type: 'confirmation',
          content: panel([
            text(`Hello, **${origin}**!`),
            text('This custom confirmation is just for display purposes.'),
            text(
              'But you can edit the snap source code to make it do something, if you want to!',
            ),
          ]),
        },
      });
    default:
      throw new Error('Method not found.');
  }
};
*/