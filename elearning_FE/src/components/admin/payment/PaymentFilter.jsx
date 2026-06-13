import React from 'react';
import { Row, Col, Input, Select, DatePicker, Button } from 'antd';
import { SearchOutlined, DownloadOutlined } from '@ant-design/icons';

const { Option } = Select;
const { RangePicker } = DatePicker;

const PaymentFilter = ({ onFilterChange, onExportCSV }) => {

  const handleKeywordChange = (e) => {
    onFilterChange({ keyword: e.target.value });
  };

  const handleStatusChange = (value) => {
    onFilterChange({ status: value });
  };

  const handleDateChange = (dates, dateStrings) => {
    if (dates) {
      onFilterChange({ startDate: dateStrings[0], endDate: dateStrings[1] });
    } else {
      onFilterChange({ startDate: null, endDate: null });
    }
  };

  return (
    <div style={{ backgroundColor: '#fff', padding: '16px 24px', borderRadius: '12px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      <Row gutter={[16, 16]} align="middle" justify="space-between">
        <Col xs={24} md={18}>
          <Row gutter={[16, 16]}>

            <Col xs={24} sm={8}>
              <RangePicker 
                onChange={handleDateChange} 
                style={{ width: '100%', borderRadius: '8px' }} 
                size="large"
                placeholder={['Từ ngày', 'Đến ngày']}
              />
            </Col>
          </Row>
        </Col>
        
        <Col xs={24} md={6} style={{ textAlign: 'right' }}>
          <Button 
            icon={<DownloadOutlined />} 
            onClick={onExportCSV}
            size="large"
            style={{ borderRadius: '8px' }}
          >
            Xuất CSV
          </Button>
        </Col>
      </Row>
    </div>
  );
};

export default PaymentFilter;
