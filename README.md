<h1 align="center">Cenoteando</h1>

<p align="center">
  <a href="https://cenoteando.org">
    <img src="https://img.shields.io/website?url=https%3A%2F%2Fcenoteando.org" alt="Website">
  </a>
  <a href="https://github.com/prettier/prettier">
    <img src="https://img.shields.io/badge/code_style-prettier-ff69b4.svg?" alt="code style: prettier">
  </a>
  <a href="https://github.com/cenoteandoDB/cenoteando/blob/main/LICENSE.md">
    <img src="https://img.shields.io/github/license/cenoteandoDB/cenoteando" alt="License">
  </a>
</p>

<p align="center">
  <a href="https://github.com/cenoteandoDB/cenoteando/issues">
    <img src="https://img.shields.io/github/issues/CenoteandoDB/cenoteando" alt="Issues">
  </a>
  <a href="https://snyk.io/test/github/cenoteandoDB/cenoteando?targetFile=frontend/package.json">
    <img src="https://snyk.io/test/github/cenoteandoDB/cenoteando/badge.svg?targetFile=frontend/package.json" alt="Frontend vulnerabilities">
  </a>
  <a href="https://libraries.io/github/cenoteandoDB/cenoteando">
    <img src="https://img.shields.io/librariesio/github/CenoteandoDB/cenoteando" alt="Frontend Dependencies">
  </a>
</p>
<!-- TODO: Setup CI/CD
<p align="center">
  <a href="">
    <img src="https://img.shields.io/circleci/build/github/cenoteandoDB/cenoteando/main" alt="Build">
  </a>
  <a href="https://hub.docker.com/repository/docker/cenoteandomx/cenoteando">
    <img alt="Docker Build Status" src="https://img.shields.io/docker/cloud/build/cenoteandomx/cenoteando">
  </a>
  <a href="https://codecov.io/gh/cenoteandoDB/cenoteando">
    <img src="https://codecov.io/gh/cenoteandoDB/cenoteando/branch/main/graph/badge.svg?token=YV5CZCAHWT" alt="Code Coverage"/>
  </a>
</p>
-->

<div align="center">
  <img align="center" src="https://cenoteando.org/img/icons/android-chrome-192x192.png" alt="Cenoteando" width="192">
</div>

<p align="left"><i><b>Vue.js</b> web application and <b>Spring-boot</b> API</i></p>
<p align="center"><i>a <b>cenote information repository</b> with <b>ArangoDB</b> database</i></p>
<p align="right"><i>for <b>researchers</b>, <b>authorities</b> and <b>tourism</b></i></p>

<p align="center">
  <a href="#about">About</a> •
  <a href="#technologies">Technologies</a> •
  <a href="#installation">Installation</a> •
  <a href="#contributing">Contributing</a> •
  <a href="#license">License</a>
</p>

# About

<div align="center">
  <img align="center" src="https://cenoteando.org/img/screenshots/frontpage.png" alt="Cenoteando Frontpage" width="400">
</div>

<!-- TODO: About this project (short description) -->
(COMING SOON)

# Technologies

* Download required
  * [Make](https://www.gnu.org/software/make/)
  * [Docker](https://www.docker.com/)
  * [Docker Compose](https://docs.docker.com/compose/)
* Frontend (development)
  * [Node 16](https://nodejs.org/en/) ([Node Version Manager](https://github.com/nvm-sh/nvm) recommended)
* Backend (development)
  * [Java 17](https://www.oracle.com/java/technologies/downloads/#java17)
  * [Maven](https://maven.apache.org/download.cgi)
* No download required
  * [ArangoDB](https://arangodb.com/)
  * [Spring-boot](https://www.arangodb.com/docs/stable/foxx.html)
  * [Vue.js](https://vuejs.org/)

# Installation

## Debian

### 0. Clone repository and sub-modules

```bash
# Clone repository
git clone https://github.com/cenoteandoDB/cenoteando.git

# Change into cloned directory
cd cenoteando

# Checkout dev branch
git checkout dev

# Initialize submodules
git submodule init

# Update submodules
git submodule update
```

### 1. Update system and install dependencies

```bash
# Update apt index and upgrade packages
sudo apt update && sudo apt upgrade -y

# Install make and other build tools
sudo apt install build-essential
```

### 2. Install Docker

Follow instructions in [Install Docker Engine on Debian](https://docs.docker.com/engine/install/debian/).

As of Feb 2022, install instructions can be summarized as follows:

```bash
# Remove old versions (it's OK to ignore errors in this step)
sudo apt remove docker docker-engine docker.io containerd runc

# Install dependencies
sudo apt install -y \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

# Add Docker's official GPG key
curl -fsSL https://download.docker.com/linux/debian/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Add Docker repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/debian \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io

# Add current user to docker group
sudo usermod -aG docker $(whoami)
```

### 3. Install Docker Compose

Follow instructions in [Install Docker Compose](https://docs.docker.com/compose/install/).

As of Feb 2022, install instructions can be summarized as follows:

```bash
# Download Docker Compose (version 1.29.2) binary
sudo curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# Apply executable permissions to the binary
sudo chmod +x /usr/local/bin/docker-compose
```

Install Docker Compose bash completion _(optional)_:

```bash
# Download bash completions (version 1.29.2)
sudo curl \
    -L https://raw.githubusercontent.com/docker/compose/1.29.2/contrib/completion/bash/docker-compose \
    -o /etc/bash_completion.d/docker-compose

# Reload settings (alternatively, reload terminal)
source ~/.bashrc
```

### 4. Install Node.js for Frontend Development (optional)

Follow instructions in [Installing Node Version Manager](https://github.com/nvm-sh/nvm#installing-and-updating).

As of Feb 2022, install instructions can be summarized as follows:

```bash
# Download & run nvm install script (version 0.39.1)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash

# Reload settings (alternatively, reload terminal)
source ~/.bashrc

# Install Node.js 16
nvm install 16
```

### 4. Install Java 17 for Backend Development (optional)

Download `jdk-17_linux-x64_bin.deb` from [this link](https://www.oracle.com/java/technologies/downloads/#java17)

Open a terminal in the directory where `jdk-17_linux-x64_bin.deb` is and run the following commands:

```bash
# Install Oracle JDK 17 (it's OK to ignore unmet dependencies)
sudo dpkg -i jdk-17_linux-x64_bin.deb

# Fix missing dependencies
sudo apt --fix-broken install
```

### 5. Reboot

```bash
sudo reboot
```

### 6. Run project

```bash
make start
```

<!-- TODO: Create documentation page -->
* **Access <http://localhost> to see the frontend**
* **The backend is mounted at <http://localhost/api>**
* **Access <http://localhost:8529> to navigate the database**
* **Check out the [documentation](https://example.com).** (COMING SOON)

# Contributing

Your contributions are always welcome! Please have a look at the [contribution guidelines](https://github.com/cenoteandoDB/cenoteando/blob/main/CONTRIBUTING.md) first.

We strive for a respectful and inclusive community. Interactions not respecting our [code of conduct](https://github.com/cenoteandoDB/cenoteando/blob/main/CODE_OF_CONDUCT.md) will not be tolerated.

# License

This project is licensed under the MIT License - see the [LICENSE](https://github.com/cenoteandoDB/cenoteando/blob/main/LICENSE.md) file for details.
