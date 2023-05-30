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
    this.cover_image_project_attachment_id = 0;
    this.parent_project_id = 0;
    this.is_spatial_data_required = 0;
    this.created_date = new Date();
    this.modified_date = new Date();
    this.last_modified_by = '';
    this.created_by = '';
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

  setCoverImageProjectAttachmentId(cover_image_project_attachment_id) {
    this.cover_image_project_attachment_id = cover_image_project_attachment_id;
    return this;
  }

  setParentProjectId(parent_project_id) {
    this.parent_project_id = parent_project_id;
    return this;
  }

  setIsSpatialDataRequired(is_spatial_data_required) {
    this.is_spatial_data_required = is_spatial_data_required;
    return this;
  }

  setCreatedDate(created_date) {
    this.created_date = created_date;
    return this;
  }

  setModifiedDate(modified_date) {
    this.modified_date = modified_date;
    return this;
  }

  setLastModifiedBy(last_modified_by) {
    this.last_modified_by = last_modified_by;
    return this;
  }

  setCreatedBy(created_by) {
    this.created_by = created_by;
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
      this.cover_image_project_attachment_id,
      this.parent_project_id,
      this.is_spatial_data_required,
      this.created_date,
      this.modified_date,
      this.last_modified_by,
      this.created_by
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
    cover_image_project_attachment_id,
    parent_project_id,
    is_spatial_data_required,
    created_date,
    modified_date,
    last_modified_by,
    created_by
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
    this.cover_image_project_attachment_id = cover_image_project_attachment_id;
    this.parent_project_id = parent_project_id;
    this.is_spatial_data_required = is_spatial_data_required;
    this.created_date = created_date;
    this.modified_date = modified_date;
    this.last_modified_by = last_modified_by;
    this.created_by = created_by;
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
    cover_image_project_attachment_id,
    parent_project_id,
    is_spatial_data_required,
    created_date,
    modified_date,
    last_modified_by,
    created_by,
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
      cover_image_project_attachment_id,
      parent_project_id,
      is_spatial_data_required,
      created_date,
      modified_date,
      last_modified_by,
      created_by
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
      this.cover_image_project_attachment_id,
      this.parent_project_id,
      this.is_spatial_data_required,
      this.created_date,
      this.modified_date,
      this.last_modified_by,
      this.created_by,
      this.amount
    );
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
