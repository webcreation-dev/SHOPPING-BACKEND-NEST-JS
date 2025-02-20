import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { RedocModule, RedocOptions } from '@jozefazz/nestjs-redoc';
import * as process from 'process';

export async function setupRedoc(app: INestApplication) {
  const documentBuilder = new DocumentBuilder()
    .setTitle('LOGO')
    .setVersion('1.0')
    .setDescription('Powered by Jozefazz')
    .addBearerAuth(
      {
        description: `Please enter token in following format: Bearer <JWT>`,
        name: 'Authorization',
        bearerFormat: 'Bearer',
        scheme: 'Bearer',
        type: 'http',
        in: 'Header',
      },
      'access-token',
    );

  if (process.env.API_VERSION) {
    documentBuilder.setVersion(process.env.API_VERSION);
  }

  const document = SwaggerModule.createDocument(app, documentBuilder.build());
  const redocOptions: RedocOptions = {
    title: 'LOCAPAY',
    logo: {
      url: 'https://www.locapay.com/assets/images/logo.png',
      backgroundColor: '#d0e8c5',
      altText: 'LOGO',
    },
    theme: {
      typography: {
        fontSize: '16px',
        fontWeightBold: '900',
      },
      sidebar: {
        backgroundColor: '#d0e8c5',
      },
      rightPanel: {
        backgroundColor: '#01312b',
      },
    },
    sortPropsAlphabetically: true,
    hideDownloadButton: false,
    hideHostname: false,
    noAutoAuth: true,
    pathInMiddlePanel: true,
    // auth: {
    //   enabled: true,
    //   user: 'admin',
    //   password: 'admin',
    // },
    // tagGroups: [
    //   {
    //     name: 'Core resources',
    //     tags: ['authentication', 'user'],
    //   },
    // ],
  };
  await RedocModule.setup('docs', app, document, redocOptions);
}
