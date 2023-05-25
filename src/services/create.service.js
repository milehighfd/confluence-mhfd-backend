import moment from "moment";
//Project
class Project {
  constructor() {
    this.name = "";
    this.description = "";
    this.creator = "";
    this.creationDate = "";
  }

  setName(name) {
    this.name = name;
    return this;
  }

  setDescription(description) {
    this.description = description;
    return this;
  }

  setCreator(creator) {
    this.creator = creator;
    return this;
  }

  setCreationDate() {
    this.creationDate = moment().format();
    return this;
  }

  build() {
    return {
      name: this.name,
      description: this.description,
      creator: this.creator,
      creationDate: this.creationDate,
    };
  }
}


const project = new Project()
    .setName('test')
    .setDescription('test desc')
    .setCreator('test creator')
    .setCreationDate()
    .build();

console.log(project)
