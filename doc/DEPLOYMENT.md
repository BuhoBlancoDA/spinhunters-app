# Deployment Guide for SpinHunters POS

This document provides detailed instructions for packaging and deploying the SpinHunters POS application, using the existing Supabase configuration and generating an executable (.exe) file for distribution.

## Table of Contents

1. [Prerequisites](#prerequisites)
   - [Tool Installation](#tool-installation)
   - [Environment Setup](#environment-setup)

2. [Application Packaging](#application-packaging)
   - [Code Preparation](#code-preparation)
   - [Supabase Configuration](#supabase-configuration)
   - [Creating the Executable](#creating-the-executable)
   - [Testing the Executable](#testing-the-executable)

3. [Continuous Deployment](#continuous-deployment)
   - [GitHub Actions Configuration](#github-actions-configuration)
   - [Creating Releases](#creating-releases)
   - [Automatic Updates](#automatic-updates)

4. [Distribution](#distribution)
   - [Installers](#installers)
   - [Security Considerations](#security-considerations)
   - [Monitoring and Maintenance](#monitoring-and-maintenance)

## Prerequisites

To package and deploy the SpinHunters POS application, you'll need to install and configure the following components on your development machine:

### Tool Installation

#### Node.js v20 LTS

Node.js is the JavaScript runtime environment needed to compile the application.

1. **Windows Installation**:
   - Download the installer from [nodejs.org](https://nodejs.org/)
   - Select the LTS (Long Term Support) v20.x.x version
   - Run the installer and follow the instructions
   - Verify the installation by opening a terminal and running:
     ```powershell
     node -v  # Should display v20.x.x
     ```

2. **macOS Installation**:
   - You can use Homebrew:
     ```bash
     brew install node@20
     ```
   - Or download the installer from [nodejs.org](https://nodejs.org/)
   - Verify the installation with `node -v`

3. **Linux Installation**:
   - Using apt (Ubuntu/Debian):
     ```bash
     curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
     sudo apt-get install -y nodejs
     ```
   - Verify the installation with `node -v`

#### pnpm ≥ 9

pnpm is the package manager used to install and manage project dependencies.

1. **Global Installation**:
   ```powershell
   npm install -g pnpm@latest
   ```

2. **Verification**:
   ```powershell
   pnpm -v  # Should display 9.x.x or higher
   ```

#### Git

Git is necessary to clone the repository and manage version control.

1. **Windows Installation**:
   - Download the installer from [git-scm.com](https://git-scm.com/)
   - Run the installer and follow the instructions
   - During installation, choose the option "Git from the command line and also from 3rd-party software"
   - Verify the installation with `git --version`

2. **macOS Installation**:
   - If you have Homebrew:
     ```bash
     brew install git
     ```
   - Or install Xcode Command Line Tools:
     ```bash
     xcode-select --install
     ```
   - Verify the installation with `git --version`

3. **Linux Installation**:
   - Using apt (Ubuntu/Debian):
     ```bash
     sudo apt-get update
     sudo apt-get install git
     ```
   - Verify the installation with `git --version`

### Environment Setup

1. **Clone the repository**:
   ```powershell
   git clone https://github.com/spinhunters/pos.git
   cd pos
   ```

2. **Install dependencies**:
   ```powershell
   pnpm install
   ```

3. **Verify environment variables**:
   - Check that the `.env.production` file exists in the root directory with the correct Supabase credentials:
     ```
     VITE_SUPABASE_URL=https://cvkooqqlxlttoplkxgla.supabase.co
     VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
     ```
   - These credentials correspond to the Supabase project that's already in use for both development and production
   - Do not create a new project or modify these credentials unless specifically instructed to do so

## Application Packaging

In this section, you'll learn how to package the SpinHunters POS application using the existing Supabase configuration to create an executable (.exe) file that can be distributed and installed on other computers.

### Code Preparation

1. **Check the current version**:
   - Open the `package.json` file and review the `version` field
   - If you need to update the version, modify this value following semantic versioning (MAJOR.MINOR.PATCH)
   - For example, change `"version": "0.1.0"` to `"version": "0.1.1"`

2. **Update the source code**:
   - Make sure all necessary changes are implemented and working correctly
   - Commit your changes:
     ```powershell
     git add .
     git commit -m "Preparation for packaging v0.1.1"
     ```

### Supabase Configuration

For packaging, we'll use the existing Supabase configuration that's already working correctly. The same Supabase project is used for both local development and production environments, so there's no need to create a new project or environment.

1. **Verify Supabase credentials**:
   - Make sure the `.env.production` file in the root directory contains the correct credentials:
     ```
     VITE_SUPABASE_URL=https://cvkooqqlxlttoplkxgla.supabase.co
     VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
     ```
   - These credentials correspond to the Supabase project that's already in use for both development and production

2. **Test the Supabase connection**:
   - Run the application in production mode to verify it connects correctly:
     ```powershell
     set NODE_ENV=production
     pnpm start
     ```
   - Navigate to the "Settings" section in the application and click "Test Connection"
   - You should see a "Connected" message if everything is configured correctly

### Creating the Executable

Now we'll create the executable (.exe) using Electron Forge, which is configured in the project.

1. **Package the application**:
   ```powershell
   set NODE_ENV=production
   pnpm package
   ```
   This command will create a packaged version of the application in the `out` folder, but without creating an installer.

2. **Create the installer**:
   ```powershell
   set NODE_ENV=production
   pnpm make
   ```
   This command will create a Windows installer (.exe) in the `out/make` folder.

3. **Location of generated files**:
   - The packaged executable will be in: `out/spin-pos-win32-x64`
   - The installer will be in: `out/make/squirrel.windows/x64/spin-pos-0.1.1 Setup.exe` (adjust the version accordingly)

### Testing the Executable

It's important to test the executable before distributing it to ensure it works correctly.

1. **Test the packaged executable**:
   - Navigate to the `out/spin-pos-win32-x64` folder
   - Run `spin-pos.exe`
   - Verify that the application starts correctly and can connect to Supabase
   - Test the main functionalities to ensure everything works as expected

2. **Test the installer**:
   - Run the `out/make/squirrel.windows/x64/spin-pos-0.1.1 Setup.exe` file
   - Follow the installer instructions
   - Verify that the application installs correctly and creates a shortcut in the Start menu
   - Open the installed application and verify it works correctly

3. **Common troubleshooting**:
   - **Supabase connection error**: Verify that the credentials in `env/.env.production` are correct
   - **Blank screen**: This might be a resource loading issue. Check the logs in `%APPDATA%\spin-pos\logs`
   - **Startup error**: Make sure all dependencies are correctly installed with `pnpm install`

## Continuous Deployment

Continuous deployment allows you to automate the packaging and distribution process using GitHub Actions. This makes it easier to create new versions and distribute them to users.

### GitHub Actions Configuration

GitHub Actions is configured in the repository to automate the build and publish process when a new version tag is created.

1. **Verify the existing configuration**:
   - The configuration file is located at `.github/workflows/release.yml`
   - This file defines the workflow for building and publishing the application

2. **Verify secrets in GitHub**:
   - Go to the repository settings in GitHub
   - Navigate to "Settings" > "Secrets and variables" > "Actions"
   - Make sure the following secrets exist and match the values in `.env.production`:
     - `SUPABASE_URL`: Should be `https://cvkooqqlxlttoplkxgla.supabase.co`
     - `SUPABASE_ANON_KEY`: Should match the anon key in `.env.production`
   - These secrets are used during the build process to configure the Supabase connection
   - It's critical that these values match the existing Supabase project that's used for both development and production

3. **Verify the publish configuration**:
   - Open the `package.json` file and check the `build.publish` section:
     ```json
     "publish": [
       {
         "provider": "github"
       }
     ]
     ```
   - This configuration indicates that the installers will be published to GitHub Releases

### Creating Releases

To create a new version of the application and deploy it automatically:

1. **Update the version**:
   - Open the `package.json` file
   - Increment the version number following semantic versioning (MAJOR.MINOR.PATCH)
   - For example, change `"version": "0.1.0"` to `"version": "0.1.1"`

2. **Create a commit with the changes**:
   ```powershell
   git add package.json
   git commit -m "Update version to 0.1.1"
   ```

3. **Create a tag for the new version**:
   ```powershell
   git tag v0.1.1
   git push origin v0.1.1
   ```
   Note: The tag must start with "v" followed by the exact version number you specified in package.json.

4. **Monitor the build process**:
   - Go to the "Actions" tab in the GitHub repository
   - You should see a new "Build and Release" workflow running
   - Wait for the workflow to complete (it may take several minutes)

5. **Verify the publication**:
   - Once the workflow is complete, go to the "Releases" tab in the GitHub repository
   - You should see a new release with the version you just created
   - The release will include installers for Windows, macOS, and Linux

### Automatic Updates

The application is configured to automatically check for and apply updates using electron-updater.

1. **How automatic updates work**:
   - When the application starts, it checks if new versions are available
   - If it finds a new version, it downloads it in the background
   - Once downloaded, it notifies the user that an update is available
   - The user can choose to install the update immediately or postpone it

2. **Update configuration**:
   - The configuration is in `src/main/main.ts`
   - It uses the `electron-updater` module to manage updates
   - It looks for updates in GitHub Releases based on the `package.json` configuration

3. **Testing updates**:
   - To test the update system, create a new version following the steps above
   - Install an older version of the application
   - Start the application and verify that it detects and downloads the new version

## Distribution

Once you've created the installers, you can distribute them to end users in various ways.

### Installers

The installers generated by the build process are ready for distribution:

1. **Types of installers**:
   - **Windows**: `.exe` file created with Squirrel.Windows
   - **macOS**: `.dmg` file (if configured)
   - **Linux**: `.deb` and `.rpm` files (if configured)

2. **Installer locations**:
   - Installers are automatically published to GitHub Releases
   - You can also find them locally in the `out/make` folder after running `pnpm make`

3. **Manual distribution**:
   - You can download the installers from GitHub Releases
   - Share them with users via cloud storage, email, or any other method
   - Provide clear installation instructions

### Database Migrations

When deploying updates to the database schema, it's important to follow a structured approach to ensure data integrity and minimize downtime.

#### Migration Order

1. **Always create a backup** of `auth.*` and `public.*` schemas before applying migrations.
2. **Execute migrations in staging** first, then in production with a maintenance window and rollback plan.
3. **Apply migrations in the correct order**:
   - `01_initial_schema.sql` - Initial database structure
   - `02_rls_policies.sql` - Basic RLS policies
   - `03_schema_alignment.sql` - Schema alignment with auth.users, ENUMs, constraints, and updated RLS

#### Rollback Plan

If something goes wrong during migration:

1. **Restore the backup** of `public.*` and `auth.*` schemas.
2. If the failure is in **policies** or **functions**, re-apply the previous state from version control.
3. Keep a **reversible migration file** (Up/Down) in `/supabase/sql/`.

#### Post-Deploy Tests

After applying migrations, run these verification tests:

```sql
-- A) Verify id alignment
SELECT COUNT(*) AS misaligned
FROM public.users u
LEFT JOIN auth.users au ON au.id = u.id
WHERE au.id IS NULL;
-- Should return 0

-- B) Verify RLS policies (test with different user sessions)

-- C) Verify uniqueness constraint for active memberships
SELECT user_id, plan, COUNT(*)
FROM public.memberships
WHERE status='active'
GROUP BY user_id, plan
HAVING COUNT(*)>1;
-- Should return 0

-- D) Test update_expired_memberships function
SELECT public.update_expired_memberships();

-- E) Verify admin users are visible
SELECT * FROM public.admin_users LIMIT 5;
```

### Security Considerations

When distributing the application, it's important to consider the following security aspects:

1. **Credential protection**:
   - Never include Supabase credentials in the source code
   - Use environment variables and GitHub secrets to store credentials
   - Make sure the `.env.production` file is not included in version control
   - **Never expose `service_role` key in the client**

2. **Row Level Security (RLS) policies**:
   - Verify that RLS policies are correctly configured in Supabase
   - These policies control what data users can view and modify
   - Make sure users can only access the data they need
   - Ensure that users cannot activate memberships themselves

3. **Security updates**:
   - Keep all dependencies updated to avoid vulnerabilities
   - Run `pnpm audit` regularly to identify security issues
   - Update the application when vulnerabilities are discovered

### Monitoring and Maintenance

Once the application is deployed, it's important to monitor its operation and perform regular maintenance.

#### Backups

Backups are essential to protect the application's data:

1. **Automated backups**:
   - The system is configured to perform daily backups using GitHub Actions
   - The workflow is defined in `.github/workflows/db-backup.yml`
   - Backups are stored in Google Drive and the last 30 versions are kept

2. **Manual backups**:
   - From the application: Go to Settings > Backup > "Export Data (CSV)"
   - From Supabase: Use the backup function in the dashboard

3. **Backup verification**:
   - Regularly verify that backups are being performed correctly
   - Periodically test restoring a backup in a test environment

#### Performance Monitoring

To ensure the application works correctly:

1. **Application logs**:
   - Logs are stored in the application's data directory:
     - Windows: `%APPDATA%\SpinHunters POS\logs`
     - macOS: `~/Library/Logs/SpinHunters POS`
     - Linux: `~/.config/SpinHunters POS/logs`
   - Review these logs to diagnose issues

2. **Supabase monitoring**:
   - Use the Supabase dashboard to monitor performance
   - Review storage usage, slow queries, and errors
   - Configure alerts to be notified of potential issues

3. **Preventive maintenance**:
   - Perform periodic cleanups of old or unnecessary data
   - Optimize frequently executed queries
   - Regularly update the application and its dependencies

## Conclusion

By following this guide, you've learned how to package and deploy the SpinHunters POS application using the existing Supabase configuration. You can now:

1. Prepare the development environment
2. Package the application into an executable (.exe)
3. Configure continuous deployment with GitHub Actions
4. Distribute the application to end users
5. Monitor and maintain the application in production

**Important**: This project uses a single Supabase project for both local development and production environments. This approach ensures consistency across environments and simplifies the deployment process. Always use the credentials in the `.env.production` file and do not create separate Supabase projects for different environments unless specifically instructed to do so.

## Additional Resources

- [Architecture Documentation](ARCHITECTURE.md) - Overview of the system architecture
- [Database Structure](DATABASE.md) - Information about the database structure and schema
- [Main README](../README.md) - General information and troubleshooting
