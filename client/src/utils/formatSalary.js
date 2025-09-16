export const formatSalaryToLPA = (salary) => {
    if (!salary) return '0';
    return `${(salary).toFixed(1)} LPA`;
};

export const formatSalaryRange = (min, max) => {
    if (!min && !max) return 'Not Disclosed';
    if (!max) return `₹${formatSalaryToLPA(min)}+`;
    if (!min) return `Up to ₹${formatSalaryToLPA(max)}`;
    return `₹${formatSalaryToLPA(min)} - ₹${formatSalaryToLPA(max)}`;
};