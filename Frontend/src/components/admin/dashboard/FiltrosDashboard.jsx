import React from 'react';
import { Select, DatePicker, Button, Space, Row, Col, Typography } from 'antd';
import { FilterOutlined, ReloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Option } = Select;
const { RangePicker } = DatePicker;
const { Text } = Typography;

const FiltrosDashboard = ({ filtros, onFiltrosChange, onRefresh }) => {
  const handleRangoChange = (value) => {
    onFiltrosChange({
      ...filtros,
      rango: value
    });
  };

  const handleFechaRangeChange = (dates) => {
    onFiltrosChange({
      ...filtros,
      fechaInicio: dates ? dates[0].toISOString() : null,
      fechaFin: dates ? dates[1].toISOString() : null
    });
  };

  const handleRefresh = () => {
    onRefresh && onRefresh();
  };

  return (
    <Row gutter={[24, 24]} align="middle">
      <Col xs={24} md={6}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-500">
             <FilterOutlined />
          </div>
          <Text className="!font-black !text-sm !tracking-tight">FILTRAR RESULTADOS</Text>
        </div>
      </Col>
      
      <Col xs={24} md={18}>
        <Space wrap size="middle" className="w-full justify-end">
          <div className="flex flex-col">
            <Text className="!text-[10px] !font-bold !text-slate-400 !mb-1 uppercase tracking-widest">Período Predefinido</Text>
            <Select
              value={filtros.rango}
              onChange={handleRangoChange}
              style={{ minWidth: '150px' }}
              className="custom-select"
              placeholder="Seleccionar período"
            >
              <Option value="dia">Hoy</Option>
              <Option value="semana">Esta Semana</Option>
              <Option value="mes">Este Mes</Option>
            </Select>
          </div>

          <div className="flex flex-col">
            <Text className="!text-[10px] !font-bold !text-slate-400 !mb-1 uppercase tracking-widest">Rango Personalizado</Text>
            <RangePicker
              onChange={handleFechaRangeChange}
              format="DD/MM/YYYY"
              className="custom-datepicker"
              placeholder={['Inicio', 'Fin']}
              disabledDate={(current) => current && current > dayjs().endOf('day')}
            />
          </div>

          <div className="flex items-end self-end h-[56px] pb-1">
            <Button
              type="primary"
              shape="round"
              size="large"
              icon={<ReloadOutlined />}
              onClick={handleRefresh}
              className="!bg-blue-600 !border-0 !font-bold shadow-lg shadow-blue-500/20"
            >
              Aplicar
            </Button>
          </div>
        </Space>
      </Col>
    </Row>
  );
};

export default FiltrosDashboard;