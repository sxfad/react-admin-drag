const express = require('express');
const {getTableNames, getTableColumns} = require('./my-sql');
const {
    COMMON_EXCLUDE_FIELDS,
    getConfigFromDbTable,
    writeFiles,
    readSwagger,
} = require('./util');

const router = express.Router();

router.get('/tables', async (req, res) => {
    const {dbUrl} = req.query;
    const tables = await getTableNames(dbUrl);

    if (tables && tables.length) {
        for (const table of tables) {
            table.columns = await getTableColumns(dbUrl, table.name);
        }
    }

    res.send({tables, ignoreFields: COMMON_EXCLUDE_FIELDS});
});

router.post('/preview', async (req, res) => {
    const {tables} = req.body;

    let configs = [];
    tables.map(getConfigFromDbTable).forEach(item => {
        configs = configs.concat(item);
    });

    const result = [];
    configs.forEach(cfg => {
        let {template} = cfg;
        result.push({
            config: cfg,
            code: require(template)(cfg),
        });
    });

    res.send(result);
});

router.post('/tables', async (req, res) => {
    const {tables} = req.body;

    let configs = [];
    tables.map(getConfigFromDbTable).forEach(item => {
        configs = configs.concat(item);
    });

    const result = writeFiles(configs);

    res.send(result);
});

router.get('/swagger', async (req, res, next) => {
    const {swaggerUrl, method, userName, password} = req.query;
    const {origin, pathname} = new URL(swaggerUrl);
    const url = `${origin}/v2/api-docs`; // TODO swagger版本是啥？

    const config = {
        url,
        userName,
        password,
    };
    const search = method === 'get' ? {
        method,
        url: pathname,
        dataPath: '', // TODO
        excludeFields: COMMON_EXCLUDE_FIELDS,
    } : null;

    const modify = method !== 'get' ? {
        method,
        url: pathname,
        dataPath: '', // TODO
        excludeFields: COMMON_EXCLUDE_FIELDS,
    } : null;

    const baseConfig = {
        ajax: {
            search,
            modify,
        },
    };

    const result = await readSwagger(config, baseConfig);
    result.moduleName = pathname.replace(/\//g, '-');
    if (result.moduleName.startsWith('-')) result.moduleName = result.moduleName.replace('-', '');

    res.send(result);
});
module.exports = router;
