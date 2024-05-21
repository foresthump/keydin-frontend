import { autoinject, computedFrom } from "aurelia-framework";
import {
  ValidationController,
  ValidationControllerFactory,
  ValidationRules,
  validateTrigger,
} from "aurelia-validation";
import { Router } from "aurelia-router";

import { AuthService } from "./../auth.service";
import { signUpAction } from "../../tools/actions/sign-up-action";

@autoinject
export class SignUp {
  public validation: ValidationController;
  private authCode: string;
  public errors = {
    manual: false,
    oauth: false,
  };

  public firstName: string;
  public surname: string;
  public email: string;
  public password: string;
  public confirmPassword: string;
  public error: string;

  constructor(
    private authService: AuthService,
    private router: Router,
    validationControllerFactory: ValidationControllerFactory
  ) {
    this.validation = validationControllerFactory.createForCurrentScope();
    this.validation.validateTrigger = validateTrigger.change;
  }

  public activate(params: { code?: string }): void {
    this.authCode = params?.code;
  }

  private initValidation(): void {
    ValidationRules.customRule(
      "validName",
      (value: any) => {
        return /^[A-Za-z]+(?:-[A-Za-z]+)*(?:\s+[A-Za-z]+(?:-[A-Za-z]+)*)*$/.test(
          value
        );
      },
      "Please enter a valid name."
    );

    ValidationRules.customRule(
      "validLength",
      (value: any) => {
        return value && value.length >= 8 && value.length <= 64;
      },
      "Password must be between 8 and 64 characters."
    );
    ValidationRules.customRule(
      "hasDigit",
      (value: any) => /\d/.test(value),
      "Password must contain at least one digit (0-9)."
    );

    ValidationRules.customRule(
      "hasLowercase",
      (value: any) => /[a-z]/.test(value),
      "Password must contain at least one lowercase letter (a-z)."
    );

    ValidationRules.customRule(
      "hasUppercase",
      (value: any) => /[A-Z]/.test(value),
      "Password must contain at least one uppercase letter (A-Z)."
    );

    ValidationRules.customRule(
      "hasSpecialChar",
      (value: any) => /[^\w\s]/.test(value),
      "Password must contain at least one special character (except whitespace)."
    );
    ValidationRules.customRule(
      "noWhitespace",
      (value: any) => /^\S+$/.test(value),
      "Password cannot contain whitespace at the end."
    );

    ValidationRules.customRule(
      "passwordsMatch",
      (value: any) => this.password && this.password === value,
      `Password and Password confirmation doesn't match.`
    );

    ValidationRules.ensure("firstName")
      .required()
      .withMessage("Please enter your Firstname.")
      .satisfiesRule("validName")
      .ensure("surename")
      .required()
      .withMessage("Please enter your Lastname.")
      .satisfiesRule("validName")

      .ensure("email")
      .required()
      .withMessage("Please enter email")
      .email()
      .withMessage("Please enter a valid email")

      .then()
      .ensure("password")
      .required()
      .withMessage("Please enter a Password.")
      .then()
      .satisfiesRule("validLength")
      .when(() => this.password && this.password.length > 0)
      .then()
      .satisfiesRule("hasDigit")
      .then()
      .satisfiesRule("hasLowercase")
      .then()
      .satisfiesRule("hasUppercase")
      .then()
      .satisfiesRule("hasSpecialChar")
      .then()
      .satisfiesRule("noWhitespace")
      .then()
      .ensure("confirmPassword")
      .required()
      .withMessage("Please enter a Password Confirmation.")
      .then()
      .satisfiesRule("passwordsMatch")
      .on(this);
  }

  public attached(): void {
    console.log(" ::>> this.authCode >>>> ", this.authCode);
    if (this.authCode) {
      this.errors = {
        manual: false,
        oauth: false,
      };
      this.triggerSignUp();
    }
  }

  private async triggerSignUp(): Promise<void> {
    try {
      const user = await this.authService.handleOAuthSignUpCallback(
        this.authCode
      );
      console.log(" ::>> logged in successfully ");
      if (!user) {
        this.errors.oauth = true;
        this.handleFailure();
        return;
      }
    } catch (e) {
      console.error("Failed to signUp due to", e);
      this.errors.oauth = true;
      this.handleFailure();
    }
  }

  private handleFailure(): void {
    console.error("Something went wrong >>> ", this.errors);
    const currentInstruction = this.router.currentInstruction;
    const { config, params } = currentInstruction;
    const pathWithoutQueryParams = this.router.generate(config.name, params);
    this.router.navigate(pathWithoutQueryParams, { replace: true });
    this.authCode = null;
  }

  public manualSignUp(): void {
    console.log(" ::>> manualSignUp >>>> ", this.email, this.password);
    this.errors.manual = null;
    this.errors.oauth = null;
    this.validation.validate().then(async (validation) => {
      console.log(" ::>> validation >>>> ", this.validation);
      if (!validation.valid) return;
      this.authCode = "validuser";
      try {
        this.authService
          .signUpWithCredentials(
            this.firstName,
            this.surname,
            this.email,
            this.password
          )
          .catch((e) => {
            console.log("Failed to sign up due to ", e);
            if (e.statusCode === 401) {
              this.error = "The email enetered has already been registered.";
            }
            this.authCode = null;
          });
      } catch (e) {
        console.error("Failed to signUp due to", e);
        this.errors.manual = true;
        this.handleFailure();
        this.authCode = null;
      }
    });
  }
  @computedFrom("authCode")
  public get actionsDisabled(): boolean {
    return !!this.authCode;
  }
}
