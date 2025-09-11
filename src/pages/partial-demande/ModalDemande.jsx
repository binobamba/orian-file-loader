import React, { useState } from 'react';
import {
  Modal,
  Button,
  Upload,
  message,
  Form,
  Input,
  DatePicker,
  Select,
  Typography,
  Space,
  Alert
} from 'antd';
import {
  UploadOutlined,
  FileOutlined,
  InboxOutlined
} from '@ant-design/icons';

const { Title } = Typography;
const { TextArea } = Input;
const { Dragger } = Upload;

const ModalDemande = ({ visible, onCancel, onSuccess, mode, demandeId }) => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);

  // Props pour l'upload de fichier
  const uploadProps = {
    onRemove: (file) => {
      const index = fileList.indexOf(file);
      const newFileList = fileList.slice();
      newFileList.splice(index, 1);
      setFileList(newFileList);
    },
    beforeUpload: (file) => {
      // Vérification du type de fichier (exemple: seulement Excel et CSV)
      const isExcelOrCSV = file.type === 'application/vnd.ms-excel' || 
                          file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
                          file.type === 'text/csv';
      
      if (!isExcelOrCSV) {
        message.error('Vous ne pouvez uploader que des fichiers Excel ou CSV!');
        return Upload.LIST_IGNORE;
      }

      // Vérification de la taille (max 10MB)
      const isLt10M = file.size / 1024 / 1024 < 10;
      if (!isLt10M) {
        message.error('Le fichier doit être inférieur à 10MB!');
        return Upload.LIST_IGNORE;
      }

      setFileList([...fileList, file]);
      return false; // Empêche l'upload automatique
    },
    fileList,
  };

  // Gestion de la soumission du formulaire
  const handleSubmit = async (values) => {
    if (fileList.length === 0) {
      message.error('Veuillez sélectionner un fichier à uploader');
      return;
    }

    setUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', fileList[0]);
      
      // Ajouter d'autres données si nécessaire
      Object.keys(values).forEach(key => {
        if (values[key]) {
          formData.append(key, values[key]);
        }
      });

      // Ici vous feriez l'appel à votre API
      // const response = await api.processFile(formData);
      
      message.success('Fichier uploadé avec succès!');
      onSuccess(); // Fermer la modal et rafraîchir les données
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error);
      message.error('Erreur lors de l\'upload du fichier');
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setFileList([]);
    onCancel();
  };

  return (
    <Modal
      title={
        <Title level={4} style={{ margin: 0 }}>
          {mode === 'create' ? 'Nouvelle Demande' : 'Modifier la Demande'}
        </Title>
      }
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={600}
      centered
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          type: 'OPERATION',
          description: ''
        }}
      >
        <Alert
          message="Information"
          description="Veuillez uploader un fichier Excel ou CSV contenant les données de votre demande."
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />

        <Form.Item
          name="type"
          label="Type de demande"
          rules={[{ required: true, message: 'Veuillez sélectionner un type' }]}
        >
          <Select placeholder="Sélectionnez le type de demande">
            <Select.Option value="OPERATION">Opération</Select.Option>
            <Select.Option value="INTEGRATION">Intégration</Select.Option>
            <Select.Option value="VALIDATION">Validation</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="description"
          label="Description"
        >
          <TextArea
            placeholder="Description de la demande (optionnel)"
            rows={3}
          />
        </Form.Item>

        <Form.Item
          label="Fichier à uploader"
          required
          rules={[{ required: true, message: 'Veuillez sélectionner un fichier' }]}
        >
          <Dragger
            {...uploadProps}
            accept=".xlsx,.xls,.csv"
            maxCount={1}
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">
              Cliquez ou glissez-déposez un fichier ici
            </p>
            <p className="ant-upload-hint">
              Supporte les fichiers Excel (.xlsx, .xls) et CSV. Taille max: 10MB
            </p>
          </Dragger>
          
          {fileList.length > 0 && (
            <div style={{ marginTop: 8 }}>
              <Space>
                <FileOutlined />
                <span>{fileList[0].name}</span>
                <span>({(fileList[0].size / 1024 / 1024).toFixed(2)} MB)</span>
              </Space>
            </div>
          )}
        </Form.Item>

        <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
          <Space>
            <Button onClick={handleCancel}>
              Annuler
            </Button>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={uploading}
              icon={<UploadOutlined />}
              disabled={fileList.length === 0}
            >
              {uploading ? 'Traitement...' : 'Créer la demande'}
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ModalDemande;