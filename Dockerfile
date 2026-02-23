# Use a imagem oficial do Bun como base
FROM oven/bun:latest as base

# Define o diretório de trabalho dentro do container
WORKDIR /app

# Copia os arquivos de dependência
COPY package.json bun.lockb* ./
# Copia o schema do Prisma
COPY prisma ./prisma/

# Instala as dependências do projeto
RUN bun install

# Gera o client do Prisma (necessário para a comunicação com o banco de dados)
RUN bunx prisma generate

# Copia o restante do código da aplicação
COPY . .

# Expõe a porta que a aplicação (Elysia) normalmente utiliza (ajuste se for diferente de 3000)
EXPOSE 3004

# Comando para iniciar a aplicação
CMD ["bun", "run", "src/index.ts"]
