export class ProjectError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ProjectError';
  }
}

export class ProjectAttachmentError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ProjectAttachmentError';
  }
}

export class ProjectBoardsError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ProjectBoardsError';
  }
}

export class ProjectSponsorsError extends Error {
  constructor(message, options) {
    super(message, options);
    this.name = 'ProjectSponsorsError';
  }
}

export class NotFoundError extends Error {
  constructor(message, options) {
    super(message, options);
    this.name = 'NotFoundError';
  }
}

export class ProjectLocalGovernmentError extends Error {
  constructor(message, options) {
    super(message, options);
    this.name = 'ProjectLocalGovernmentError';
  }
}

export class ProjectCountiesError extends Error {
  constructor(message, options) {
    super(message, options);
    this.name = 'ProjectCountiesError';
  }
}

export class ProjectServiceAreasError extends Error {
  constructor(message, options) {
    super(message, options);
    this.name = 'ProjectServiceAreasError';
  }
}
export class ProjectActionsError extends Error {
  constructor(message, options) {
    super(message, options);
    this.name = 'ProjectActionsError';
  }
}

export class ProjectCostsError extends Error {
  constructor(message, options) {
    super(message, options);
    this.name = 'ProjectCostsError';
  }
}