'use strict';

module.exports = {
  teamLink(team) {
    return `{"type": "teamLink", "id": "${team.id}", "name": "${team.name}"}`;
  },
  projectLink(project) {
    return `{"type": "projectLink", "id": "${project.id}", "name": "${project.name}"}`;
  },
  categoryLink(category) {
    return `{
      "type": "categoryLink",
      "id": "${category.id}",
      "name": "${category.name}",
      "projectId": "${category.projectId}"
    }`;
  },
  apiLink(api) {
    return `{
      "type": "apiLink",
      "id": "${api.id}",
      "name": "${api.name}",
      "projectId": "${api.projectId}"
    }`;
  },
  userLink(user) {
    return `{"type": "userLink", "id": "${user.id}", "name": "${user.name}"}`;
  },
  roleTag(role) {
    return `{"type": "roleTag", "role": "${role}"}`;
  },
  getUpdateDetail(map, prevObj, nextObj) {
    const detail = [];
    Object.entries(map).forEach(([ key, label ]) => {
      const prevValue = prevObj[key];
      const nextValue = nextObj[key];
      if (prevValue !== nextValue) detail.push(`${label}<<->>${prevValue} -->> ${nextValue}`);
    });
    return detail.join('\n');
  },
};
