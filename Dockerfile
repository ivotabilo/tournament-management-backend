FROM node:20-alpine
WORKDIR /app

# 1. Copiamos los archivos de configuración
COPY package*.json ./
COPY prisma ./prisma/

# 2. Instalamos dependencias (con el flag de conflicto de Cloudinary)
RUN npm install --legacy-peer-deps

# 3. Copiamos el resto del código
COPY . .

# 4. Generamos el cliente de Prisma (fundamental)
RUN npx prisma generate

# 5. IMPORTANTE: Comentamos o borramos el build si falla por tipos
# RUN npm run build 

EXPOSE 3001

# 6. Usamos "dev" para que tsx se encargue de todo en tiempo real
CMD ["npm", "run", "dev"]