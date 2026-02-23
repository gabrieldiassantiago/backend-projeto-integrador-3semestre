FROM oven/bun:latest as base

WORKDIR /app

COPY package.json bun.lockb* ./

COPY prisma ./prisma/

RUN bun install

RUN bunx prisma generate

COPY . .

EXPOSE 3004

CMD ["bun", "run", "src/index.ts"]
