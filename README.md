# Cap-stone UI

An e-commerce application I developed for my capstone project powered by Angular 17.

## Getting Started

You'll need the backend up and running (if it is not public, I have not decided to open-source it).

## Architecture

Project is split into two different fronts.

1. [Store Front](https://capstone.emmanueluluabuike.com/) : This is where customers visit to purchase products.
2. [Admin Front](https://capstone.emmanueluluabuike.com/admin) : This is where employees or staff manage products.

## 3rd Party Technologies

The project utilizes several third-party technologies:

- Tailwind CSS.
- PrimeNG
- Paystack: A payment gateway for processing online payments.

## Building Docker Image

### Using Dockerfile

- `docker build --tag <chose-a-name>:latest . --progress=plain --build-arg="PORT=<choose-a-port-number>"`

### Using Buildpacks

- [Install pack](https://buildpacks.io/docs/tools/pack/)
- Set default `pack config default-builder paketobuildpacks/builder:base`
  or `pack config default-builder <you-builder-choice>`
- Convert to image `pack build <image-name> -b paketo-buildpacks/web-servers
--env "BP_WEB_SERVER=nginx"
--env "BP_WEB_SERVER_ROOT=dist/capstone"
--env "BP_WEB_SERVER_ENABLE_PUSH_STATE=true"
--env "NODE_ENV=development"`

# License

You are free to use this code as you wish, just not any of the images (including the logo). If you do use this code,
please give credit to this repo.

## Contributors

As I have completed my degree, I do not plan on contributing to this anytime too but feel free to reach out if you
have any questions or need assistance!
