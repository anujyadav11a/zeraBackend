/**
 * Build population options based on query parameters
 * Prevents unnecessary data fetching and duplicate populations
 * 
 * Usage: ?populate=assignee,reporter,parent
 *        ?populate=assignee:name,email;reporter:name,email
 */

export const buildPopulation = (query = "") => {
    if (!query) return [];

    const populateArray = [];
    const populateItems = query.split(",").map(item => item.trim());

    for (const item of populateItems) {
        // Check if specific fields are requested: "assignee:name,email"
        if (item.includes(":")) {
            const [path, fieldsStr] = item.split(":");
            const fields = fieldsStr.split(";").map(f => f.trim()).join(" ");
            
            populateArray.push({
                path: path.trim(),
                select: fields || "-__v"
            });
        } else {
            // Default population with name and email
            const defaultFields = getDefaultFields(item.trim());
            populateArray.push({
                path: item.trim(),
                select: defaultFields
            });
        }
    }

    return populateArray;
};

/**
 * Get default fields to populate for each entity
 */
const getDefaultFields = (path) => {
    const defaultFieldMap = {
        assignee: "name email avatar role",
        reporter: "name email avatar role",
        parent: "key title type priority status",
        "history.by": "name email",
        project: "name key"
    };

    return defaultFieldMap[path] || "name email";
};

/**
 * Apply population to a query
 */
export const applyPopulation = (query, populateArray) => {
    let populatedQuery = query;

    for (const pop of populateArray) {
        populatedQuery = populatedQuery.populate(pop.path, pop.select);
    }

    return populatedQuery;
};

/**
 * Default safe populations (used when no populate param provided)
 */
export const getDefaultPopulation = () => {
    return [
        {
            path: "assignee",
            select: "name email"
        },
        {
            path: "reporter",
            select: "name email"
        }
    ];
};
