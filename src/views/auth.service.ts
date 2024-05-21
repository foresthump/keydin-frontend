import { autoinject } from "aurelia-framework";
import { HttpClient } from "aurelia-http-client";
import { EncryptTools } from "tools/encrypt.tools";
import { TokenSettings } from "tools/token-settings";

@autoinject
export class AuthService {
  constructor(private httpClient: HttpClient) {}

  public async authenticateWithCredentials(
    password: string,
    email?: string,
    phoneNumber?: string
  ): Promise<any> {
    const ENCRYPTED_PASSWORD = EncryptTools.encrypt(password);
    const params = { email, phoneNumber, password: ENCRYPTED_PASSWORD };
    console.log(" ::>> params >>>>> ", params);
    const response = await this.httpClient
      .createRequest("http://192.168.3.154:3000/passport/authenticate")
      .asPost() /*ip /passport/authenticate*/
      .withContent(params)
      .withHeader("Authorization", TokenSettings.ANONYMOUS_TOKEN)
      .send()
      .then((response) => {
        const user: any = response;
        this.setHeader(user.token);
        return user;
      })
      .catch((e) => {
        console.log("Failed to authenticate due to ", e);
        throw new Error("Failed to authenticate");
      });

    if (!response) {
      throw new Error("Failed to authenticate");
    }
    return response;
  }

  public async handleOAuthLogInCallback(
    authorizationCode: string
  ): Promise<any> {
    console.log(" ::>> authorizationCode >>>>> ", authorizationCode);
    if (!authorizationCode) {
      // Handle error if no authorization code is present
      return;
    }

    const response = await this.httpClient
      .createRequest("/auth/google")
      .asPost()
      .withContent({ authorizationCode })
      .withHeader("Content-Type", "application/json")
      .withHeader("Authorization", TokenSettings.ANONYMOUS_TOKEN)
      .send()
      .catch((e) => {
        console.log("Failed to authenticate due to ", e);
        throw new Error("Failed to authenticate");
      });

    console.log(" ::>> response >>>>>> ", response);

    if (!response) {
      throw new Error("Failed to authenticate");
    }
    return response;
  }

  //////////////////// Register ////////////////////

  public async handleOAuthSignUpCallback(
    authorizationCode: string
  ): Promise<any> {
    console.log(" ::>> authorizationCode >>>>> ", authorizationCode);
    if (!authorizationCode) {
      // Handle error if no authorization code is present
      return;
    }

    const response = await this.httpClient
      .createRequest("/auth/google")
      .asPost()
      .withContent({ authorizationCode })
      .withHeader("Content-Type", "application/json")
      .withHeader("Authorization", TokenSettings.ANONYMOUS_TOKEN)
      .send()
      .catch((e) => {
        console.log("Failed to authenticate due to ", e);
        throw new Error("Failed to authenticate");
      });

    console.log(" ::>> response >>>>>> ", response);

    if (!response) {
      throw new Error("Failed to authenticate");
    }
    return response;
  }

  public async signUpWithCredentials(
    firstName: string,
    surname: string,
    email: string,
    password: string
  ): Promise<any> {
    const ENCRYPTED_PASSWORD = EncryptTools.encrypt(password);
    const params = {
      firstName,
      surname,
      email,
      password: ENCRYPTED_PASSWORD,
    };
    console.log(" ::>> params >>>>> ", params);
    const response = await this.httpClient
      .createRequest("/passport/submit")
      .asPost()
      .withContent(params)
      .withHeader("Content-Type", "application/json")
      .withHeader("Authorization", TokenSettings.ANONYMOUS_TOKEN)
      .send();

    if (!response) {
      throw new Error("Failed to sign up");
    }
    return response;
  }

  public async registerUsingGoogleInternally(): Promise<void> {
    //
  }

  public async handleRegisterCallback(authorizationCode: string): Promise<any> {
    //
  }

  public setHeader(token: string): void {
    this.httpClient.configure((req) => {
      req.withHeader("Authorization", "Bearer " + token);
    });
  }

  public completeRegistration(token: string, password: string): Promise<void> {
    const encryptedPassword = EncryptTools.encrypt(password);

    return new Promise((resolve) => {
      this.httpClient
        .createRequest("/passport/complete-registration")
        .asPost()
        .withContent({
          password: encryptedPassword,
        })
        .withHeader("Content-Type", "application/json")
        .withHeader("Authorization", `Bearer ${token}`)
        .send()
        .then(
          (response) => {
            console.log(" ::>> response ", response);
            resolve();
          },
          (error) => {
            console.warn(" ::>> error ", error);
          }
        );
    });
  }

  public removeRegistration(token: string): Promise<any> {
    return this.httpClient
      .createRequest("/passport/remove-registration")
      .asDelete()
      .withHeader("Content-Type", "application/json")
      .withHeader("Authorization", `Bearer ${token}`)
      .send();
  }
}
