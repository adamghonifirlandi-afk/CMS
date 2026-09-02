import { Request, Response } from 'express';
import prisma from '../../utils/prisma';
import { isValidMidtransNotification } from '../../utils/midtrans';
import { addMonths, addYears } from 'date-fns';

export const handleMidtransWebhook = async (req: Request, res: Response) => {
    try {
        const notification = req.body;

        const {
            order_id,
            transaction_status,
            fraud_status,
            status_code,
            gross_amount,
            signature_key,
            payment_type,
            transaction_id,
            transaction_time,
        } = notification;

        console.log('Midtrans webhook received:', {
            order_id,
            transaction_status,
            fraud_status,
        });

        // verifikasi signature
        const isValid = isValidMidtransNotification(
            order_id,
            status_code,
            gross_amount,
            signature_key
        );

        if (!isValid) {
            console.error('Invalid Midtrans signature');
            return res.status(400).json({
                success: false,
                message: 'Invalid signature',
            });
        }

        let subscriptionId = order_id;
        let isUpgrade = false;

        if (order_id.startsWith('UPG-')) {
            const parts = order_id.split('-');
            subscriptionId = parts[1];
            isUpgrade = true;
        }

        // get subscription and payment transaction
        const subscription = await prisma.subscription.findUnique({
            where: { id: subscriptionId },
            include: {
                plan: true,
                organization: true,
            },
        });

        if (!subscription) {
            console.error(`Subscription not found: ${subscriptionId}`);
            return res.status(404).json({
                success: false,
                message: 'Subscription not found',
            });
        }

        // update payment transaction
        await prisma.paymentTransaction.updateMany({
            where: {
                subscriptionId: subscription.id,
                transactionId: order_id,
            },
            data: {
                status: transaction_status,
                webhookData: notification,
            },
        });

        // handle berdasarkan status transaksi
        if (transaction_status === 'capture' || transaction_status === 'settlement') {
            // payment berhasil
            if (fraud_status === 'accept' || !fraud_status) {
                if (isUpgrade) {
                    // handle upgrade
                    // get new plan dari transaksi pembayaran
                    const paymentTx = await prisma.paymentTransaction.findFirst({
                        where: {
                            subscriptionId: subscription.id,
                            transactionId: order_id,
                        },
                    });

                    if (paymentTx) {
                        // update subscription dengan plan baru
                        await prisma.subscription.update({
                            where: { id: subscription.id },
                            data: {
                                status: 'ACTIVE',
                                lastPaymentDate: new Date(transaction_time),
                            },
                        });
                    }
                } else {
                    // mengaktifkan subscription untuk new subscription
                    await prisma.subscription.update({
                        where: { id: subscription.id },
                        data: {
                            status: 'ACTIVE',
                            lastPaymentDate: new Date(transaction_time),
                        },
                    });

                    // create usage tracking jika belum ada
                    const existingUsage = await prisma.usageTracking.findFirst({
                        where: { subscriptionId: subscription.id },
                    });

                    if (!existingUsage) {
                        const endDate = subscription.endDate || addMonths(new Date(), 1);
                        
                        await prisma.usageTracking.create({
                            data: {
                                subscriptionId: subscription.id,
                                periodStart: new Date(),
                                periodEnd: endDate,
                            },
                        });
                    }
                }

                // create billing history
                const invoiceNumber = `INV-${Date.now()}-${subscription.id.substring(0, 8)}`;
                
                await prisma.billingHistory.create({
                    data: {
                        subscriptionId: subscription.id,
                        invoiceNumber,
                        planName: subscription.plan.name,
                        amount: subscription.plan.price,
                        status: 'PAID',
                        paidAt: new Date(transaction_time),
                        paymentMethod: payment_type,
                    },
                });

                console.log(`Payment successful for subscription: ${subscription.id}`);
            }
        } else if (transaction_status === 'pending') {
            // pembayaran tertunda
            console.log(`Payment pending for subscription: ${subscription.id}`);
        } else if (transaction_status === 'deny' || transaction_status === 'cancel' || transaction_status === 'expire') {
            // pembayaran dibatalkam
            await prisma.subscription.update({
                where: { id: subscription.id },
                data: {
                    status: 'CANCELLED',
                },
            });

            await prisma.billingHistory.create({
                data: {
                    subscriptionId: subscription.id,
                    invoiceNumber: `INV-FAILED-${Date.now()}`,
                    planName: subscription.plan.name,
                    amount: subscription.plan.price,
                    status: 'FAILED',
                    paymentMethod: payment_type,
                },
            });

            console.log(`Payment failed for subscription: ${subscription.id}`);
        }

        return res.status(200).json({
            success: true,
            message: 'Webhook processed successfully',
        });
    } catch (error: any) {
        console.error('Error processing Midtrans webhook:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to process webhook',
            error: error.message,
        });
    }
};