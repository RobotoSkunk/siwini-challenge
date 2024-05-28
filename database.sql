
CREATE USER example WITH PASSWORD 'example';

CREATE DATABASE siwini_itspr WITH OWNER example ENCODING 'UTF8' TEMPLATE template0;

GRANT ALL PRIVILEGES ON DATABASE siwini_itspr TO example;
ALTER DEFAULT PRIVILEGES GRANT ALL ON TABLES TO example;
ALTER DEFAULT PRIVILEGES GRANT ALL ON SEQUENCES TO example;
ALTER DEFAULT PRIVILEGES GRANT ALL ON FUNCTIONS TO example;


-- Tables

CREATE TABLE admin_access (
	id TEXT PRIMARY KEY,
	password TEXT NOT NULL
);

CREATE TABLE pictures (
	id TEXT PRIMARY KEY,
	x128 BYTEA,
	x256 BYTEA,
	x512 BYTEA,
	x1024 BYTEA,
	x2048 BYTEA
);

CREATE TABLE categories (
	id SERIAL PRIMARY KEY,
	name TEXT NOT NULL
);

CREATE TABLE forms (
	id TEXT PRIMARY KEY,
	robot_name TEXT NOT NULL,
	category INT NOT NULL,
	robot_picture TEXT,

	team_name TEXT NOT NULL,
	team_captain TEXT NOT NULL,
	team_captain_email TEXT NOT NULL,
	team_captain_phone TEXT,
	assistant_1 TEXT NOT NULL,
	assistant_2 TEXT NOT NULL,
	consultant TEXT NOT NULL,

	institution_or_company TEXT NOT NULL,
	country TEXT,

	checkout_picture TEXT,

	FOREIGN KEY (category) REFERENCES categories (id) ON DELETE CASCADE,
	FOREIGN KEY (robot_picture) REFERENCES pictures (id) ON DELETE SET DEFAULT,
	FOREIGN KEY (checkout_picture) REFERENCES pictures (id) ON DELETE SET DEFAULT
);

CREATE TABLE blogs (
	id SERIAL PRIMARY KEY,
	picture TEXT,
	title TEXT NOT NULL,
	content TEXT NOT NULL,

	FOREIGN KEY (picture) REFERENCES pictures (id) ON DELETE SET DEFAULT
);

CREATE TABLE visits (
	count INT NOT NULL
);

--- Default values

INSERT INTO categories(name) VALUES ('Minisumo Autónomo 500 gr.'),
									('Minisumo Radio Control 500 gr.'),
									('Microsumo Autónomo 100gr.'),
									('Sumo 3 Kg. Autónomo.'),
									('Sumo 3 Kg. Radio Control.'),
									('Seguidor de Línea.'),
									('Carrera de Insectos.'),
									('Soccer.'),
									('Guerra de Robots de 1 Libra.'),
									('Guerra de Robots de 3 Libras.'),
									('Guerra de Robots de 12 Libras.'),
									('Guerra de Robots de 32 Libras.'),
									('Robótica de Aplicación.'),
									('Exhibición de Drones.');

INSERT INTO visits(count) VALUES (0);
