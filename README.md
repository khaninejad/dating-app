
# AWS Serverless Typescript API for Dating App

This project is a Serverless AWS Node.js and Typescript template for building a mini API that could power a simple dating app. The functionality is split into three parts, and an optional bonus. Each part involves writing Node.js and building a small NoSQL database.

## Getting Started

To get started, clone the repository and install the dependencies using npm:


    `git clone https://github.com/khaninejad/dating-app.git
    cd aws-serverless-typescript-api
    npm install` 

## Configuration

You will need to set up your AWS credentials in order to deploy the API. You can do this by setting the `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` environment variables, or by using the `aws configure` command.

## Running Locally

To run the API locally, use the following command:

`npm run start` 

This will start the API on `http://localhost:3000/dev/`.

## Endpoints

### User

-   `POST /user/create` - creates a new user with the following fields: 

``` {"name": "x", "email": "test@test.com", "password": "123456", "gender": "female", "birth_date": "1991/01/01", "location" : {"longitude": 17.5729, "latitude": -154.0226}, "random": true}  ```

if random = true present then it will generate random user otherwise will check the body for create a user.
### Profiles

-   `GET /profiles` - fetches potential matches for the user specified by the `user_id` parameter.

    e.g.: 

``` profiles?user_id=01a1bf15-5066-4d52-9d39-647159f3314d&age_from=1950-10-10&age_to=2010-10-10&prefer=female&sort_by=distance ```

-   `POST /swipe` - responds to a profile with the specified `profile_id` and `preference` (YES or NO) for the user specified by the `user_id` parameter.

e.g.:

``` {"user_id": "b99bf24a-ef68-4166-9f01-979a387b6dfb", "profile_id": "01a1bf15-5066-4d52-9d39-647159f3314d", "preference": "YES"} ```

### Authentication

-   `POST /login` - authenticates a user with the specified `email` and `password` and returns a **token**.
- The token should be provided in the HTTP header of the request

### Filtering

-   `GET /profiles?gender=<gender>&age_from=<date_from>&age_to=<date_to>` - fetches potential matches for the authenticated user with the specified gender and age range.
-   `GET /profiles?sort_by=distance` - sorts potential matches for the authenticated user by distance.
-   `GET /profiles?sort_by=attractiveness` - sorts potential matches for the authenticated user by attractiveness.

## Scripts

-   `npm run seed` - seeds the database with test data only for local development
-   `npm run test` - runs the tests using Jest.
-   `npm run deploy` - deploys the API to AWS.

