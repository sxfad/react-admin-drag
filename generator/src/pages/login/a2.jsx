import { useState } from 'react';
import config from 'src/commons/config-hoc';
import { PageContent, QueryBar, FormItem, ToolBar } from '@ra-lib/admin';
import { Form, Space, Button, Table, Divider, Popconfirm } from 'antd';

export default config({
  path: '/route',
})(function Page(props) {
  const [dataSource, setDataSource] = useState([]);

  const columns = [
    { title: '姓名', dataIndex: 'name' },
    { title: '年龄', dataIndex: 'age' },
    {
      title: '操作',
      dataIndex: 'operator',
      render: () => (
        <div>
          <a>修改</a>
          <Divider type="vertical" />
          <Popconfirm title="您确定删除吗？">
            <a style={{ color: 'red' }}>删除</a>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <PageContent>
      <QueryBar>
        <Form layout="inline">
          <FormItem label="姓名" name="field1" />
          <FormItem label="年龄" name="field2" min={0} type="number" />
          <FormItem
            label="工作"
            name="field3"
            options={[
              { value: '1', label: '选项1' },
              { value: '2', label: '选项2' },
            ]}
            type="select"
          />
          <FormItem label="入职日期" name="field4" type="date" />
          <FormItem>
            <Space>
              <Button type="primary" htmlType="submit">
                提交
              </Button>
              <Button>重置</Button>
            </Space>
          </FormItem>
        </Form>
      </QueryBar>
      <ToolBar>
        <Button type="primary">添加</Button>
        <Button type="primary" danger>
          批量删除
        </Button>
        <Button>导出</Button>
      </ToolBar>
      <Table
        pagination={false}
        dataSource={dataSource}
        rowKey="id"
        columns={columns}
      />
    </PageContent>
  );
});