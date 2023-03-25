![Payrest](https://telegra.ph/file/468567d0f02e43bf62c88.png)

# Billing for Payme payment provider

Ready to deploy project with fiscalization, handling all errors and customer notifier in Telegram.

In project we use [**Nest.js**](https://nestjs.com/), [**TypeScript**](https://www.typescriptlang.org/) and [**Prisma**](https://www.prisma.io/).

## How to use it?

1. Clone this repo
2. Install dependencies with package manager (my choice is [**pnPM**](https://pnpm.io/))
3. Setup your Prisma environment and connect to your database. Your scheme may differ, but be careful not to delete the main properties in **Transaction** and **Reason**. Also you need to create Reasons in your database like described in [docs](https://developer.help.paycom.uz/metody-merchant-api/tipy-dannykh). It won't be superfluous to check how the code works.
4. Configure env variables like in example
5. Edit your error messages and locales
6. Run script `pnpm start:dev` or `npm run start:dev` to make sure project is works and ready to deploy
7. Deploy to the server and set your test merchant keys
8. Go to the [Sandbox Page](https://developer.help.paycom.uz/pesochnitsa) and check all tests with your Test Dev environments. Then send request to Payme supports for tests.
9. When everything is done, launch the project

## What included in this project?

- all required requests for launch (whithout [SetFiscalData](https://developer.help.paycom.uz/metody-merchant-api/setfiscaldata), because we are sending fiscal data in [CheckPerformTransaction](https://developer.help.paycom.uz/metody-merchant-api/checktransaction))
- fiscalization
- discounts
- telegram notifier
- prisma for connecting any database
- typescript for a better understanding business logic, type all data and handling errors without pain
- easy auth, guards, filters and other Nest.js nice joys

## What can be improved?
You can add your custom notifier, or add [no refund option](https://github.com/ShinkarenkoMaxim/payrest/blob/330ea1343f434ea0926e14c724fcd2cabc4430a6/src/payme/payme.service.ts#L179), or add your own variant for fiscalization.
