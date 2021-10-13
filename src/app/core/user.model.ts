export class FirebaseUserModel {
  id: string;
  name: string;
  provider: string;
  email: string;

  constructor(){
    this.id = "";
    this.name = "";
    this.provider = "";
    this.email = "";
  }
}
