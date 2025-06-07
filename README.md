# Anka Tech - Case PS 20251

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Fastify](https://img.shields.io/badge/Fastify-000000?style=for-the-badge&logo=fastify&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)

Aplicação para gerenciamento de clientes e ativos financeiros, desenvolvida com TypeScript, Docker, Fastify (backend), Next.js (frontend) e MySQL.

---

## ✅ Requisitos Funcionais (RF)

| ID  | Descrição                                                                                     | Status       |
|-----|----------------------------------------------------------------------------------------------|--------------|
| RF1 | Cadastro de clientes (nome, email, status - ativo/inativo)                                   | ✅ Concluído  |
| RF2 | Listagem de clientes                                                                          | ✅ Concluído  |
| RF3 | Edição de clientes                                                                            | ✅ Concluído  |
| RF4 | Cadastro de ativos financeiros (nome do ativo e valor atual) por cliente                      | ✅ Concluído  |
| RF5 | Exibição de ativos financeiros por cliente                                                    | ✅ Concluído  |
| RF6 | Visualização das alocações de ativos para cada cliente                                        | ✅ Concluído  |
| RF7 | Endpoint para listar ativos financeiros (lista fixa com valores estáticos)                    | ✅ Concluído  |

---

## 📜 Regras de Negócio (RN)

| ID  | Descrição                                                                                     | Status       |
|-----|----------------------------------------------------------------------------------------------|--------------|
| RN1 | Validação dos dados de clientes (nome, email, status) usando Zod                             | ✅ Concluído  |
| RN2 | Persistência dos dados de clientes no banco MySQL via Prisma                                 | ✅ Concluído  |
| RN3 | Validação dos formulários no frontend usando React Hook Form + Zod                           | ✅ Concluído  |
| RN4 | Uso de React Query para buscar dados no backend                                              | ✅ Concluído  |

---

## ⚙️ Requisitos Não Funcionais (RNF)

| ID  | Descrição                                                                                     | Status       |
|-----|----------------------------------------------------------------------------------------------|--------------|
| RNF1 | Implementação 100% em TypeScript                                                             | ✅ Concluído  |
| RNF2 | Uso de Docker Compose para containerizar a aplicação (backend, frontend e banco de dados)    | ✅ Pendente  |
| RNF3 | Configuração do Prisma ORM para interagir com MySQL                                          | ✅ Concluído  |
| RNF4 | Uso de ShadCN para componentes de UI no frontend                                             | ✅ Concluído  |
| RNF5 | Uso de Axios para requisições HTTP no frontend                                               | ✅ Concluído  |
| RNF6 | Banco de dados MySQL rodando em um contêiner Docker                                          | ✅ Concluído  |
| RNF7 | Configuração de variáveis de ambiente no backend para conexão com o banco de dados           | ✅ Concluído  |

---


## Criar um arquivo `docker-composer.yml`
- Criar um serviço de bano de dados
- Melhor configurados em um .env
- Após configurar os dados necessários, rodar o serviço de banco de dados.
- Configurações feitas no `.env`
- É necessário configurar o backend e o db primeiro

```bash
services:
  db:
    image: mysql:8.0
    container_name: anka_tech_db
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}
      MYSQL_DATABASE: ${MYSQL_DATABASE}
      MYSQL_USER: ${MYSQL_USER}
      MYSQL_PASSWORD: ${MYSQL_PASSWORD}
    ports:
      - "0.0.0.0:3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
```

## Configurando o Prisma

- Dentro do `cd backend` executar o prisma
- Se não tiver feito as configurações pode ser sem `docker composer`
- Fazer os testes do Backend e do DB fora do container

## Root tem que dar permissão ao user que foi criado

- Executar dentro do ci do mysql root
- Você só vai conseguir executar os camandos do prisma para criar db com permissão

```bash
  -- Create user if doesn't exist (or identify existing user)
  CREATE USER IF NOT EXISTS 'user'@'%' IDENTIFIED BY 'password';

  -- Grant all privileges
  GRANT ALL PRIVILEGES ON *.* TO 'user'@'%' WITH GRANT OPTION;

  -- Grant specific privileges needed for migrations
  GRANT CREATE, ALTER, DROP, REFERENCES ON *.* TO 'user'@'%';
  GRANT RELOAD, PROCESS ON *.* TO 'user'@'%';

  -- For Prisma shadow database
  GRANT CREATE TEMPORARY TABLES ON *.* TO 'user'@'%';

  FLUSH PRIVILEGES;
```

- Alguns desses comando precisam de permissão do SGBD, verifique as permissões

```bash
  docker-compose exec backend npx prisma init --datasource-provider mysql
  docker-compose exec backend npx prisma generate
  docker-compose exec backend npx prisma migrate dev --name add_timestamps
  docker-compose exec backend npx prisma studio

  docker-compose up -d backend
```

## Acessando o Cli do MySQL dentro do docker

```bash
  docker-compose exec db mysql -u ${MYSQL_USER} -p${MYSQL_PASSWORD}
```
- -u | nome do usuário configurado no `.env`
- -p | senha definina no `.env`

## É possível acessar o `MySQL Workbench`, do que precisa:
- Nome do usuário configurado dentro do .env
- Senha do usuário configurada no .env
- Testar a conexão com os dados
- Se receber uma mensagem de sucesso só clicar em Ok



# FrontEnd

## Páginas funcionais

- [/clients](http://localhost:3000/clients) — Lista de clientes

- [/clients/[clientId]/assets](http://localhost:3000/clients/id/assets) — Ativos de um cliente

- [ /clients/edit/[clientId]](http://localhost:3000/clients/edit/id) — Edição de cliente

- [/assets](http://localhost:3000/assets) — Lista de ativos




