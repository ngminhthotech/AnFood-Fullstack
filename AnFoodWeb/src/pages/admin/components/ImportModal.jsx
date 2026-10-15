import React, { useState } from 'react';
import { Modal, Form, Input, InputNumber, Button, message } from 'antd';
import axiosAdmin from '../../../api/axiosAdmin';

const ImportModal = ({ visible, onClose, product, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();

    // Khi mở modal, set giá trị mặc định
    React.useEffect(() => {
        if (visible && product) {
            form.setFieldsValue({
                maMon: product.maMon,
                tenMon: product.tenMon,
                giaVonHienTai: product.giaVon,
                soLuongNhap: 1,
                giaNhapMoi: product.giaVon // Mặc định lấy giá vốn cũ
            });
        }
    }, [visible, product]);

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);

            // Gọi API nhập hàng (Cần viết thêm API này ở Backend sau)
            await axiosAdmin.post('/KhoHang/NhapHang', {
                maMon: product.maMon,
                soLuong: values.soLuongNhap,
                giaNhap: values.giaNhapMoi,
                ghiChu: values.ghiChu
            });

            message.success('Nhập hàng thành công!');
            onSuccess(); // Load lại bảng
            onClose();
        } catch (error) {
            message.error('Lỗi nhập hàng: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title="📦 Nhập Hàng Vào Kho"
            open={visible}
            onCancel={onClose}
            onOk={handleOk}
            confirmLoading={loading}
        >
            <Form form={form} layout="vertical">
                <Form.Item label="Tên món" name="tenMon">
                    <Input disabled />
                </Form.Item>
                
                <div style={{display:'flex', gap:'10px'}}>
                    <Form.Item label="Số lượng nhập" name="soLuongNhap" rules={[{ required: true }]} style={{flex:1}}>
                        <InputNumber min={1} style={{width:'100%'}} />
                    </Form.Item>
                    <Form.Item label="Giá nhập (VNĐ)" name="giaNhapMoi" rules={[{ required: true }]} style={{flex:1}}>
                        <InputNumber 
                            style={{width:'100%'}} 
                            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={value => value.replace(/\$\s?|(,*)/g, '')}
                        />
                    </Form.Item>
                </div>

                <Form.Item label="Ghi chú (Nhà cung cấp, Lý do...)" name="ghiChu">
                    <Input.TextArea rows={2} />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default ImportModal;