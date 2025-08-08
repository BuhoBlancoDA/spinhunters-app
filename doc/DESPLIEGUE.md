cd # Guía de Despliegue para SpinHunters POS

Este documento proporciona instrucciones detalladas para empaquetar y desplegar la aplicación SpinHunters POS, utilizando la configuración existente de Supabase y generando un archivo ejecutable (.exe) para su distribución.

## Índice

1. [Requisitos Previos](#requisitos-previos)
   - [Instalación de Herramientas](#instalación-de-herramientas)
   - [Configuración del Entorno](#configuración-del-entorno)

2. [Empaquetado de la Aplicación](#empaquetado-de-la-aplicación)
   - [Preparación del Código](#preparación-del-código)
   - [Configuración de Supabase](#configuración-de-supabase)
   - [Creación del Ejecutable](#creación-del-ejecutable)
   - [Prueba del Ejecutable](#prueba-del-ejecutable)

3. [Despliegue Continuo](#despliegue-continuo)
   - [Configuración de GitHub Actions](#configuración-de-github-actions)
   - [Creación de Releases](#creación-de-releases)
   - [Actualizaciones Automáticas](#actualizaciones-automáticas)

4. [Distribución](#distribución)
   - [Instaladores](#instaladores)
   - [Consideraciones de Seguridad](#consideraciones-de-seguridad)
   - [Monitoreo y Mantenimiento](#monitoreo-y-mantenimiento)

## Requisitos Previos

Para empaquetar y desplegar la aplicación SpinHunters POS, necesitarás instalar y configurar los siguientes componentes en tu máquina de desarrollo:

### Instalación de Herramientas

#### Node.js v20 LTS

Node.js es el entorno de ejecución JavaScript necesario para compilar la aplicación.

1. **Instalación en Windows**:
   - Descarga el instalador desde [nodejs.org](https://nodejs.org/)
   - Selecciona la versión LTS (Long Term Support) v20.x.x
   - Ejecuta el instalador y sigue las instrucciones
   - Verifica la instalación abriendo una terminal y ejecutando:
     ```powershell
     node -v  # Debe mostrar v20.x.x
     ```

2. **Instalación en macOS**:
   - Puedes usar Homebrew:
     ```bash
     brew install node@20
     ```
   - O descargar el instalador desde [nodejs.org](https://nodejs.org/)
   - Verifica la instalación con `node -v`

3. **Instalación en Linux**:
   - Usando apt (Ubuntu/Debian):
     ```bash
     curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
     sudo apt-get install -y nodejs
     ```
   - Verifica la instalación con `node -v`

#### pnpm ≥ 9

pnpm es el gestor de paquetes que utilizamos para instalar y gestionar las dependencias del proyecto.

1. **Instalación global**:
   ```powershell
   npm install -g pnpm@latest
   ```

2. **Verificación**:
   ```powershell
   pnpm -v  # Debe mostrar 9.x.x o superior
   ```

#### Git

Git es necesario para clonar el repositorio y gestionar el control de versiones.

1. **Instalación en Windows**:
   - Descarga el instalador desde [git-scm.com](https://git-scm.com/)
   - Ejecuta el instalador y sigue las instrucciones
   - Durante la instalación, elige la opción "Git from the command line and also from 3rd-party software"
   - Verifica la instalación con `git --version`

2. **Instalación en macOS**:
   - Si tienes Homebrew:
     ```bash
     brew install git
     ```
   - O instala Xcode Command Line Tools:
     ```bash
     xcode-select --install
     ```
   - Verifica la instalación con `git --version`

3. **Instalación en Linux**:
   - Usando apt (Ubuntu/Debian):
     ```bash
     sudo apt-get update
     sudo apt-get install git
     ```
   - Verifica la instalación con `git --version`

### Configuración del Entorno

1. **Clonar el repositorio**:
   ```powershell
   git clone https://github.com/spinhunters/pos.git
   cd pos
   ```

2. **Instalar dependencias**:
   ```powershell
   pnpm install
   ```

3. **Verificar variables de entorno**:
   - Verifica que el archivo `.env.production` existe en la raíz del proyecto con las credenciales correctas de Supabase:
     ```
     VITE_SUPABASE_URL=https://cvkooqqlxlttoplkxgla.supabase.co
     VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
     ```
   - Estas credenciales corresponden al proyecto Supabase que ya está en uso tanto para desarrollo como para producción
   - No crees un nuevo proyecto ni modifiques estas credenciales a menos que se te indique específicamente

## Empaquetado de la Aplicación

En esta sección, aprenderás a empaquetar la aplicación SpinHunters POS utilizando la configuración existente de Supabase para crear un archivo ejecutable (.exe) que pueda ser distribuido e instalado en otros equipos.

### Preparación del Código

1. **Verificar la versión actual**:
   - Abre el archivo `package.json` y revisa el campo `version`
   - Si necesitas actualizar la versión, modifica este valor siguiendo el formato semántico (MAJOR.MINOR.PATCH)
   - Por ejemplo, cambia `"version": "0.1.0"` a `"version": "0.1.1"`

2. **Actualizar el código fuente**:
   - Asegúrate de que todos los cambios necesarios estén implementados y funcionando correctamente
   - Realiza un commit de tus cambios:
     ```powershell
     git add .
     git commit -m "Preparación para empaquetado v0.1.1"
     ```

### Configuración de Supabase

Para el empaquetado, utilizaremos la configuración existente de Supabase que ya está funcionando correctamente. El mismo proyecto Supabase se utiliza tanto para el entorno de desarrollo local como para producción, por lo que no es necesario crear un nuevo proyecto o entorno.

1. **Verificar las credenciales de Supabase**:
   - Asegúrate de que el archivo `.env.production` en la raíz del proyecto contenga las credenciales correctas:
     ```
     VITE_SUPABASE_URL=https://cvkooqqlxlttoplkxgla.supabase.co
     VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
     ```
   - Estas credenciales corresponden al proyecto Supabase que ya está en uso tanto para desarrollo como para producción

2. **Verificar la conexión con Supabase**:
   - Ejecuta la aplicación en modo producción para verificar que se conecta correctamente:
     ```powershell
     set NODE_ENV=production
     pnpm start
     ```
   - Navega a la sección "Ajustes" en la aplicación y haz clic en "Probar conexión"
   - Deberías ver un mensaje de "Conectado" si todo está configurado correctamente

### Creación del Ejecutable

Ahora crearemos el ejecutable (.exe) utilizando Electron Forge, que está configurado en el proyecto.

1. **Empaquetar la aplicación**:
   ```powershell
   set NODE_ENV=production
   pnpm package
   ```
   Este comando creará una versión empaquetada de la aplicación en la carpeta `out`, pero sin crear un instalador.

2. **Crear el instalador**:
   ```powershell
   set NODE_ENV=production
   pnpm make
   ```
   Este comando creará un instalador para Windows (.exe) en la carpeta `out/make`.

3. **Ubicación de los archivos generados**:
   - El ejecutable empaquetado estará en: `out/spin-pos-win32-x64`
   - El instalador estará en: `out/make/squirrel.windows/x64/spin-pos-0.1.1 Setup.exe` (ajusta la versión según corresponda)

### Prueba del Ejecutable

Es importante probar el ejecutable antes de distribuirlo para asegurarse de que funciona correctamente.

1. **Probar el ejecutable empaquetado**:
   - Navega a la carpeta `out/spin-pos-win32-x64`
   - Ejecuta `spin-pos.exe`
   - Verifica que la aplicación se inicie correctamente y pueda conectarse a Supabase
   - Prueba las principales funcionalidades para asegurarte de que todo funciona como se espera

2. **Probar el instalador**:
   - Ejecuta el archivo `out/make/squirrel.windows/x64/spin-pos-0.1.1 Setup.exe`
   - Sigue las instrucciones del instalador
   - Verifica que la aplicación se instale correctamente y se cree un acceso directo en el menú de inicio
   - Abre la aplicación instalada y verifica que funcione correctamente

3. **Solución de problemas comunes**:
   - **Error de conexión a Supabase**: Verifica que las credenciales en `env/.env.production` sean correctas
   - **Pantalla en blanco**: Puede ser un problema con la carga de recursos. Verifica los logs en `%APPDATA%\spin-pos\logs`
   - **Error al iniciar**: Asegúrate de que todas las dependencias estén instaladas correctamente con `pnpm install`

## Despliegue Continuo

El despliegue continuo permite automatizar el proceso de empaquetado y distribución de la aplicación utilizando GitHub Actions. Esto facilita la creación de nuevas versiones y su distribución a los usuarios.

### Configuración de GitHub Actions

GitHub Actions está configurado en el repositorio para automatizar el proceso de compilación y publicación de la aplicación cuando se crea un nuevo tag de versión.

1. **Verificar la configuración existente**:
   - El archivo de configuración se encuentra en `.github/workflows/release.yml`
   - Este archivo define el flujo de trabajo para compilar y publicar la aplicación

2. **Verificar secretos en GitHub**:
   - Ve a la configuración del repositorio en GitHub
   - Navega a "Settings" > "Secrets and variables" > "Actions"
   - Asegúrate de que existan los siguientes secretos y que coincidan con los valores en `.env.production`:
     - `SUPABASE_URL`: Debe ser `https://cvkooqqlxlttoplkxgla.supabase.co`
     - `SUPABASE_ANON_KEY`: Debe coincidir con la clave anónima en `.env.production`
   - Estos secretos se utilizan durante el proceso de compilación para configurar la conexión con Supabase
   - Es crítico que estos valores coincidan con el proyecto Supabase existente que se utiliza tanto para desarrollo como para producción

3. **Verificar la configuración de publicación**:
   - Abre el archivo `package.json` y verifica la sección `build.publish`:
     ```json
     "publish": [
       {
         "provider": "github"
       }
     ]
     ```
   - Esta configuración indica que los instaladores se publicarán en GitHub Releases

### Creación de Releases

Para crear una nueva versión de la aplicación y desplegarla automáticamente:

1. **Actualizar la versión**:
   - Abre el archivo `package.json`
   - Incrementa el número de versión siguiendo el formato semántico (MAJOR.MINOR.PATCH)
   - Por ejemplo, cambia `"version": "0.1.0"` a `"version": "0.1.1"`

2. **Crear un commit con los cambios**:
   ```powershell
   git add package.json
   git commit -m "Actualizar versión a 0.1.1"
   ```

3. **Crear un tag para la nueva versión**:
   ```powershell
   git tag v0.1.1
   git push origin v0.1.1
   ```
   Nota: El tag debe comenzar con "v" seguido del número de versión exacto que especificaste en package.json.

4. **Monitorear el proceso de compilación**:
   - Ve a la pestaña "Actions" en el repositorio de GitHub
   - Deberías ver un nuevo flujo de trabajo "Build and Release" en ejecución
   - Espera a que el flujo de trabajo se complete (puede tardar varios minutos)

5. **Verificar la publicación**:
   - Una vez completado el flujo de trabajo, ve a la pestaña "Releases" en el repositorio de GitHub
   - Deberías ver una nueva release con la versión que acabas de crear
   - La release incluirá los instaladores para Windows, macOS y Linux

### Actualizaciones Automáticas

La aplicación está configurada para buscar y aplicar actualizaciones automáticamente utilizando electron-updater.

1. **Funcionamiento de las actualizaciones automáticas**:
   - Cuando se inicia la aplicación, verifica si hay nuevas versiones disponibles
   - Si encuentra una nueva versión, la descarga en segundo plano
   - Una vez descargada, notifica al usuario que hay una actualización disponible
   - El usuario puede elegir instalar la actualización inmediatamente o posponerla

2. **Configuración de las actualizaciones**:
   - La configuración se encuentra en `src/main/main.ts`
   - Utiliza el módulo `electron-updater` para gestionar las actualizaciones
   - Busca actualizaciones en GitHub Releases basándose en la configuración de `package.json`

3. **Prueba de las actualizaciones**:
   - Para probar el sistema de actualizaciones, crea una nueva versión siguiendo los pasos anteriores
   - Instala una versión anterior de la aplicación
   - Inicia la aplicación y verifica que detecte y descargue la nueva versión

## Distribución

Una vez que has creado los instaladores, puedes distribuirlos a los usuarios finales de varias maneras.

### Instaladores

Los instaladores generados por el proceso de compilación están listos para ser distribuidos:

1. **Tipos de instaladores**:
   - **Windows**: Archivo `.exe` creado con Squirrel.Windows
   - **macOS**: Archivo `.dmg` (si se configura)
   - **Linux**: Archivos `.deb` y `.rpm` (si se configuran)

2. **Ubicación de los instaladores**:
   - Los instaladores se publican automáticamente en GitHub Releases
   - También puedes encontrarlos localmente en la carpeta `out/make` después de ejecutar `pnpm make`

3. **Distribución manual**:
   - Puedes descargar los instaladores desde GitHub Releases
   - Compártelos con los usuarios a través de un servicio de almacenamiento en la nube, correo electrónico o cualquier otro método
   - Proporciona instrucciones claras para la instalación

### Consideraciones de Seguridad

Al distribuir la aplicación, es importante tener en cuenta las siguientes consideraciones de seguridad:

1. **Protección de credenciales**:
   - Nunca incluyas credenciales de Supabase en el código fuente
   - Utiliza variables de entorno y secretos de GitHub para almacenar credenciales
   - Asegúrate de que el archivo `.env.production` no se incluya en el control de versiones

2. **Políticas de Row Level Security (RLS)**:
   - Verifica que las políticas RLS estén correctamente configuradas en Supabase
   - Estas políticas controlan qué datos pueden ver y modificar los usuarios
   - Asegúrate de que los usuarios solo puedan acceder a los datos que necesitan

3. **Actualizaciones de seguridad**:
   - Mantén todas las dependencias actualizadas para evitar vulnerabilidades
   - Ejecuta `pnpm audit` regularmente para identificar problemas de seguridad
   - Actualiza la aplicación cuando se descubran vulnerabilidades

### Monitoreo y Mantenimiento

Una vez desplegada la aplicación, es importante monitorear su funcionamiento y realizar mantenimiento regular.

#### Copias de Seguridad

Las copias de seguridad son esenciales para proteger los datos de la aplicación:

1. **Copias de seguridad automatizadas**:
   - El sistema está configurado para realizar copias de seguridad diarias mediante GitHub Actions
   - El flujo de trabajo está definido en `.github/workflows/db-backup.yml`
   - Las copias se almacenan en Google Drive y se mantienen las últimas 30 versiones

2. **Copias de seguridad manuales**:
   - Desde la aplicación: Ve a Ajustes > Copia de Seguridad > "Exportar Datos (CSV)"
   - Desde Supabase: Utiliza la función de backup del panel de control

3. **Verificación de copias de seguridad**:
   - Verifica regularmente que las copias de seguridad se estén realizando correctamente
   - Prueba la restauración de una copia de seguridad en un entorno de prueba periódicamente

#### Monitoreo del Rendimiento

Para asegurar que la aplicación funcione correctamente:

1. **Registros de la aplicación**:
   - Los registros se almacenan en el directorio de datos de la aplicación:
     - Windows: `%APPDATA%\SpinHunters POS\logs`
     - macOS: `~/Library/Logs/SpinHunters POS`
     - Linux: `~/.config/SpinHunters POS/logs`
   - Revisa estos registros para diagnosticar problemas

2. **Monitoreo de Supabase**:
   - Utiliza el panel de control de Supabase para monitorear el rendimiento
   - Revisa el uso de almacenamiento, consultas lentas y errores
   - Configura alertas para ser notificado de problemas potenciales

3. **Mantenimiento preventivo**:
   - Realiza limpiezas periódicas de datos antiguos o innecesarios
   - Optimiza las consultas que se ejecutan con frecuencia
   - Actualiza la aplicación y sus dependencias regularmente

## Conclusión

Siguiendo esta guía, has aprendido a empaquetar y desplegar la aplicación SpinHunters POS utilizando la configuración existente de Supabase. Ahora puedes:

1. Preparar el entorno de desarrollo
2. Empaquetar la aplicación en un ejecutable (.exe)
3. Configurar el despliegue continuo con GitHub Actions
4. Distribuir la aplicación a los usuarios finales
5. Monitorear y mantener la aplicación en producción

**Importante**: Este proyecto utiliza un único proyecto Supabase tanto para el entorno de desarrollo local como para producción. Este enfoque asegura la consistencia entre entornos y simplifica el proceso de despliegue. Siempre utiliza las credenciales en el archivo `.env.production` y no crees proyectos Supabase separados para diferentes entornos a menos que se te indique específicamente.

## Recursos Adicionales

- [Documentación de Arquitectura](ARCHITECTURE.md) - Descripción general de la arquitectura del sistema
- [Estructura de la Base de Datos](DATABASE.md) - Información sobre la estructura y esquema de la base de datos
- [README Principal](../README.md) - Información general y solución de problemas
