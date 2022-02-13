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

<!-- TODO: Screenshot -->

<!-- TODO: About this project -->

(COMING SOON)

# Technologies

<!-- TODO: Make link -->
<!-- TODO: Java version and link -->
<!-- TODO: Node version and link -->
* Download required
  * [Make](https://www.example.com/)
  * [Java XX](https://www.example.com/)
  * [Maven](https://maven.apache.org/download.cgi)
  * [Node XX.XX](https://www.example.com/)
  * [Docker](https://www.docker.com/)
  * [Docker Compose](https://docs.docker.com/compose/)
* No download required
  * [ArangoDB](https://arangodb.com/)
  * [Spring-boot](https://www.arangodb.com/docs/stable/foxx.html)
  * [Vue.js](https://vuejs.org/)

# Installation

## Debian

### 1. Install Docker

Follow instructions in [Install Docker Engine on Debian](https://docs.docker.com/engine/install/debian/).

As of Feb 2022, install instructions can be summarized as follows:

```
# Update apt index and upgrade system packages
sudo apt update && sudo apt upgrade -y

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

### 2. Install Docker Compose
Follow instructions in [Install Docker Compose](https://docs.docker.com/compose/install/).

As of Feb 2022, install instructions can be summarized as follows:

```
# Download Docker Compose (version 1.29.2) binary
sudo curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# Apply executable permissions to the binary
sudo chmod +x /usr/local/bin/docker-compose
```

Install Docker Compose bash completion _(optional)_:
```
# Download bash completions
sudo curl \
    -L https://raw.githubusercontent.com/docker/compose/1.29.2/contrib/completion/bash/docker-compose \
    -o /etc/bash_completion.d/docker-compose

# Reload settings (alternatively, reload terminal)
source ~/.bashrc
```

### 3. Reboot
```
sudo reboot
```

### 4. Run project
```
make start
```

<!-- TODO: Create documentation page -->
* **Access http://localhost to see the frontend**
* **The backend is mounted at http://localhost/api**
* **Access http://localhost:8529 to navigate the database**
* **Check out the [documentation](https://example.com).** (COMING SOON)

# Contributing

Your contributions are always welcome! Please have a look at the [contribution guidelines](https://github.com/cenoteandoDB/cenoteando/blob/main/CONTRIBUTING.md) first.

We strive for a respectful and inclusive community. Interactions not respecting our [code of conduct](https://github.com/cenoteandoDB/cenoteando/blob/main/CODE_OF_CONDUCT.md) will not be tolerated.

# License

This project is licensed under the MIT License - see the [LICENSE](https://github.com/cenoteandoDB/cenoteando/blob/main/LICENSE.md) file for details.
