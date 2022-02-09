export class BoothsService {
  public static fetchBooths() {
    return Promise.resolve([
      { name: "None", key: null },
      { name: "Startup", key: "s" },
      { name: "Fast-growing", key: "m" },
      { name: "Leading", key: "l" },
    ]);
  }
}
