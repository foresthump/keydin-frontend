import { PLATFORM } from "aurelia-pal";

import { Router } from "aurelia-router";

export class dashboard {
  router: Router;

  configureRouter(config, router: Router): void {
    this.router = router;
    config.title = "keyed in";

    config.map([
      {
        route: ["", "analytics"],
        name: "analytics",
        moduleId: PLATFORM.moduleName("./admin/analytics/analytics"),
        nav: true,
        title: "Analytics",
      },
      {
        route: "contacts",
        name: "contacts",
        moduleId: PLATFORM.moduleName("./admin/contacts/contacts"),
        nav: true,
        title: "Contacts",
      },
      {
        route: "properties",
        name: "properties",
        moduleId: PLATFORM.moduleName("./admin/properties/properties"),
        nav: true,
        title: "Properties",
      },
    ]);
  }
  public goToContacts(): void {
    this.router.navigate("contacts");
  }
  public goToAnalytics(): void {
    this.router.navigate("analytics");
  }
  public goToProperties(): void {
    this.router.navigate("properties");
  }
}
