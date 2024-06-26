import { Router } from "aurelia-router";
import { PLATFORM } from "aurelia-pal";

import "./views/log-in/log-in.css";
import "global.scss";

export class App {
  router: Router;

  configureRouter(config, router: Router): void {
    this.router = router;
    config.title = "keyed in";

    config.map([
      {
        route: ["", "home"],
        name: "home",
        moduleId: PLATFORM.moduleName("./views/home/home"),
        nav: true,
        title: "Home",
      },
      {
        route: "dashboard",
        name: "dashboard",
        moduleId: PLATFORM.moduleName("./views/dashboard/dashboard"),
        nav: true,
        title: "Dashboard",
      },
      {
        route: "register",
        name: "register",
        moduleId: PLATFORM.moduleName("./views/register/register"),
        nav: true,
        title: "Register",
      },
      {
        route: "log-in",
        name: "log-in",
        moduleId: PLATFORM.moduleName("./views/log-in/log-in"),
        nav: true,
        title: "Log In",
      },
    ]);
  }

  public goToHome(): void {
    this.router.navigate("home");
  }
  public goToDashboard(): void {
    this.router.navigate("dashboard");
  }
  public goToRegister(): void {
    this.router.navigate("register");
  }
  public goToLogin(): void {
    this.router.navigate("log-in");
  }
}
