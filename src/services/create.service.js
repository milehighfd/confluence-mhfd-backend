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

  static setName(project_name) {
    this.project_name = project_name;
    return this;
  }

  static setAlias(project_alias) {
    this.project_alias = project_alias;
    return this;
  }

  static setDescription(description) {
    this.description = description;
    return this;
  }

  static setOnBase(onbase_project_number) {
    this.onbase_project_number = onbase_project_number;
    return this;
  }

  static setLocation(location) {
    this.location = location;
    return this;
  }

  static setCodeProjectTypeId(code_project_type_id) {
    this.code_project_type_id = code_project_type_id;
    return this;
  }

  static setStartDate() {
    this.start_date = moment().format();
    return this;
  }

  static setStaffLeadEmail(staff_lead_email) {
    this.staff_lead_email = staff_lead_email;
    return this;
  }

  static setCurrentProjectStatusId(current_project_status_id) {
    this.current_project_status_id = current_project_status_id;
    return this;
  }

  static setCodeMaintenanceEligibilityTypeId(code_maintenance_eligibility_type_id) {
     this.code_maintenance_eligibility_type_id =
      code_maintenance_eligibility_type_id;
      return this;
  }

  static setCreator(creator) {
    this.creator = creator;
    return this;
  }
  static build() {
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

console.log(
  ProjectBuilder
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
    .build()
);