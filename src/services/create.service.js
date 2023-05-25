import moment from 'moment';
//Project
class Project {
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
    return {
      project_name: this.project_name,
      project_alias: this.project_alias,
      description: this.description,
      onbase_project_number: this.onbase_project_number,
      location: this.location,
      code_project_type_id: this.code_project_type_id,
      start_date: this.start_date,
      staff_lead_email: this.staff_lead_email,
      current_project_status_id: this.current_project_status_id,
      code_maintenance_eligibility_type_id: this.code_maintenance_eligibility_type_id,
      creator: this.creator,
    };
  }
}

const project = new Project()
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
  .build();

console.log(project);
