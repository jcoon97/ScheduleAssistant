module.exports = {
    collectCoverage: false,
    collectCoverageFrom: [
        "<rootDir>/src/**/*.ts",
        "!<rootDir>/src/**/*.d.ts"
    ],
    coverageDirectory: "<rootDir>/coverage",
    moduleFileExtensions: [ "js", "json", "ts" ],
    testEnvironment: "node",
    testMatch: [ "**/integrations/**/*.ts", "**/units/**/*.ts" ],
    transform: {
        "^.+\\.tsx?": "ts-jest"
    },
    roots: [ "<rootDir>/src", "<rootDir>/tests" ],
    rootDir: "./",
    verbose: false
};