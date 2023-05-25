//Project
class Project {
  constructor() {
    this.name = "";
    this.description = "";
    this.creator = "";
    this.creationDate = "";
  }

  // Common methods
  setName(name) {
    this.name = name;
  }

  setDescription(description) {
    this.description = description;
  }

  setCreator(creator) {
    this.creator = creator;
  }

  setCreationDate(creationDate) {
    this.creationDate = creationDate;
  }
}
class ProjectBuilder {
  constructor() {
    this.project = new Project();
  }

  // Common methods
  setName(name) {}
  setDescription(description) {}
  setCreator(creator) {}
  setCreationDate(creationDate) {}

  // Specific method to retrieve the built project
  getProject() {}
}

class CapitalProjectBuilder extends ProjectBuilder {
  setName(name) {
    this.project.setName(name);
  }

  setDescription(description) {
    this.project.setDescription(description);
  }

  setCreator(creator) {
    this.project.setCreator(creator);
  }

  setCreationDate(creationDate) {
    this.project.setCreationDate(creationDate);
  }

  setCapitalAmount(amount) {
    this.project.capitalAmount = amount;
  }

  getProject() {
    return this.project;
  }
}

class StudyProjectBuilder extends ProjectBuilder {
  setName(name) {
    this.project.setName(name);
  }

  setDescription(description) {
    this.project.setDescription(description);
  }

  setCreator(creator) {
    this.project.setCreator(creator);
  }

  setCreationDate(creationDate) {
    this.project.setCreationDate(creationDate);
  }


  setStudyDuration(duration) {
    this.project.studyDuration = duration;
  }

  getProject() {
    return this.project;
  }
}

// Implementation of the Builder for building a Special Project
class SpecialProjectBuilder extends ProjectBuilder {
  setName(name) {
    this.project.setName(name);
  }

  setDescription(description) {
    this.project.setDescription(description);
  }

  setCreator(creator) {
    this.project.setCreator(creator);
  }

  setCreationDate(creationDate) {
    this.project.setCreationDate(creationDate);
  }

  setSpecialAttribute(attribute) {
    this.project.specialAttribute = attribute;
  }

  getProject() {
    return this.project;
  }
}

const capitalProjectBuilder = new CapitalProjectBuilder();
capitalProjectBuilder.setName("Capital Project");
capitalProjectBuilder.setDescription("Description of the Capital Project");
capitalProjectBuilder.setCreator("John Doe");
capitalProjectBuilder.setCreationDate(new Date());
capitalProjectBuilder.setCapitalAmount(1000000);

const studyProjectBuilder = new StudyProjectBuilder();
studyProjectBuilder.setName("Study Project");
studyProjectBuilder.setDescription("Description of the Study Project");
studyProjectBuilder.setCreator("Jane Smith");
studyProjectBuilder.setCreationDate(new Date());
studyProjectBuilder.setStudyDuration(6);

const specialProjectBuilder = new SpecialProjectBuilder();
specialProjectBuilder.setName("Special Project");
specialProjectBuilder.setDescription("Description of the Special Project");
specialProjectBuilder.setCreator("Alice Johnson");
specialProjectBuilder.setCreationDate(new Date());
specialProjectBuilder.setSpecialAttribute("Special Attribute");

const capitalProject = capitalProjectBuilder.getProject();
const studyProject = studyProjectBuilder.getProject();
console.log(capitalProject)
console.log(studyProject)
