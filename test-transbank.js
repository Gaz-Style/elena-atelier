const { WebpayPlus, Options, Environment, IntegrationApiKeys } = require('transbank-sdk');
try {
    const environment = process.env.TBK_ENV === 'production' ? Environment.Production : Environment.Integration;
    const options = new Options(
        '597053082620',
        '35fa2841-beee-4bc1-8074-7940f14a0325',
        environment
    );
    const webpayTx = new WebpayPlus.Transaction(options);
    console.log("Success!");
} catch (e) {
    console.error("Error:", e);
}
