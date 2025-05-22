import React from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TouchableWithoutFeedback,
  Text,
  TextInput,
  TouchableOpacity,
} from 'react-native';

interface ModalComponentProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const ModalComponent: React.FC<ModalComponentProps> = ({ visible, onClose, children }) => {
  return (
    <Modal visible={visible} animationType="fade" transparent>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalContainer}>
          <View
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: "#F5F5F5" },
            ]}
          />
          <TouchableWithoutFeedback>
            <View style={styles.modalContent}>
              {children}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    maxWidth: 500,
    marginHorizontal: "auto",
    width: "100%",
  },
  modalContent: {
    width: "100%",
    padding: 32,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 32,
    fontWeight: "500",
    color: "black",
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    width: "100%",
    gap: 16,
  },
  button: {
    flex: 1,
    backgroundColor: "#FFF",
    paddingVertical: 20,
    alignItems: "center",
    marginHorizontal: 0,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#DDD",
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "black",
  },
  input: {
    backgroundColor: "#FFF",
    height: 40,
    width: "100%",
    borderColor: "#E6E6E6",
    borderWidth: 1,
    marginVertical: 20,
    padding: 10,
    borderRadius: 8,
    fontSize: 16,
  },
});

export default ModalComponent;