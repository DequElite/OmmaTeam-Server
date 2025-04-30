import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
const cookieParser = require('cookie-parser');

dotenv.config();

async function bootstrap() {
	const app = await NestFactory.create(AppModule);

	app.setGlobalPrefix('api');
	app.useGlobalPipes(new ValidationPipe());

	// const server = app.getHttpServer();
	// const routes = server._router?.stack || [];

	// const filteredRoutes = routes
	//   .filter((r: any) => r.route)
	//   .map((r: any) => ({
	//     method: r.route.stack[0].method.toUpperCase(),
	//     path: r.route.path,
	//   }));

	// console.log('Routes:');
	// filteredRoutes.forEach(route => {
	//   console.log(`${route.method} ${route.path}`);
	// });

	const apiDocsConfig = new DocumentBuilder()
		.setTitle('OmmaTeam Server: register service API')
		.setDescription('Documentation for the REST API of the register service')
		.setVersion('1.0.0')
		.build();

	const ApiDocsDocument = SwaggerModule.createDocument(app, apiDocsConfig);

	SwaggerModule.setup('api/docs', app, ApiDocsDocument);

	// eslint-disable-next-line @typescript-eslint/no-unsafe-call
	app.use(cookieParser());
	await app.listen(process.env.PORT ?? 9002);
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
