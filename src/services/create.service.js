import moment from 'moment';
//Project
class ProjectBuilder {
  constructor() {
    this.project_name = '';
    this.project_alias = '';
    this.description = '';
    this.onbase_project_number = 0;
    this.location = '';
    this.code_project_type_id = 0;
    this.start_date = '';
    this.staff_lead_email = '';
    this.current_project_status_id = 0;
    this.code_maintenance_eligibility_type_id = 0;
    this.creator = '';
  }

  setName(project_name) {
    this.project_name = project_name;
    return this;
  }

  setAlias(project_alias) {
    this.project_alias = project_alias;
    return this;
  }

  setDescription(description) {
    this.description = description;
    return this;
  }

  setOnBase(onbase_project_number) {
    this.onbase_project_number = onbase_project_number;
    return this;
  }

  setLocation(location) {
    this.location = location;
    return this;
  }

  setCodeProjectTypeId(code_project_type_id) {
    this.code_project_type_id = code_project_type_id;
    return this;
  }

  setStartDate() {
    this.start_date = moment().format();
    return this;
  }

  setStaffLeadEmail(staff_lead_email) {
    this.staff_lead_email = staff_lead_email;
    return this;
  }

  setCurrentProjectStatusId(current_project_status_id) {
    this.current_project_status_id = current_project_status_id;
    return this;
  }

  setCodeMaintenanceEligibilityTypeId(code_maintenance_eligibility_type_id) {
    this.code_maintenance_eligibility_type_id = code_maintenance_eligibility_type_id;
    return this;
  }

  setCreator(creator) {
    this.creator = creator;
    return this;
  }

  build() {
    return new Project(
      this.project_name,
      this.project_alias,
      this.description,
      this.onbase_project_number,
      this.location,
      this.code_project_type_id,
      this.start_date,
      this.staff_lead_email,
      this.current_project_status_id,
      this.code_maintenance_eligibility_type_id,
      this.creator
    );
  }
}

class Project {
  constructor(
    project_name,
    project_alias,
    description,
    onbase_project_number,
    location,
    code_project_type_id,
    start_date,
    staff_lead_email,
    current_project_status_id,
    code_maintenance_eligibility_type_id,
    creator
  ) {
    this.project_name = project_name;
    this.project_alias = project_alias;
    this.description = description;
    this.onbase_project_number = onbase_project_number;
    this.location = location;
    this.code_project_type_id = code_project_type_id;
    this.start_date = start_date;
    this.staff_lead_email = staff_lead_email;
    this.current_project_status_id = current_project_status_id;
    this.code_maintenance_eligibility_type_id = code_maintenance_eligibility_type_id;
    this.creator = creator;
  }
}
class CapitalProject extends Project {
  constructor(
    project_name,
    project_alias,
    description,
    onbase_project_number,
    location,
    code_project_type_id,
    start_date,
    staff_lead_email,
    current_project_status_id,
    code_maintenance_eligibility_type_id,
    creator,
    amount
  ) {
    super(
      project_name,
      project_alias,
      description,
      onbase_project_number,
      location,
      code_project_type_id,
      start_date,
      staff_lead_email,
      current_project_status_id,
      code_maintenance_eligibility_type_id,
      creator
    );
    this.amount = amount;
  }
}

class CapitalProjectBuilder extends ProjectBuilder {
  constructor() {
    super();
  }

  setAmount(amount) {
    this.amount = amount;
    return this;
  }

  build() {
    return new CapitalProject(
      this.project_name,
      this.project_alias,
      this.description,
      this.onbase_project_number,
      this.location,
      this.code_project_type_id,
      this.start_date,
      this.staff_lead_email,
      this.current_project_status_id,
      this.code_maintenance_eligibility_type_id,
      this.creator,
      this.amount
    );
  }
}

console.log(
  new CapitalProjectBuilder()
    .setName('test')
    .setAlias('test alias')
    .setDescription('test desc')
    .setOnBase(123)
    .setLocation('test location')
    .setCodeProjectTypeId(123)
    .setStartDate()
    .setStaffLeadEmail('some@some.com')
    .setCurrentProjectStatusId(123)
    .setCodeMaintenanceEligibilityTypeId(123)
    .setCreator('test creator')
    .setAmount(100000)
    .build()
);