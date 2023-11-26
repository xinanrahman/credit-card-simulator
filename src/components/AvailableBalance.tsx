import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Divider,
  Link,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Input,
} from "@nextui-org/react";
import { api } from "~/utils/api";
import { Button } from "@nextui-org/react";

const AvailableBalance = () => {
  const { data: balanceData } = api.cardViews.getBalances.useQuery();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const ctx = api.useContext();
  const { mutateAsync: authTransaction } =
    api.cardActions.authorizeTransaction.useMutation({
      onSuccess: () => {
        void ctx.cardViews.getBalances.invalidate();
      },
    });

  const [amountVal, setAmountVal] = useState<string>("");
  const [name, setName] = useState<string>("");

  // TODO: Refactor to return skeleton loading component
  if (!balanceData) {
    return "Loading...";
  }

  // Handles closing the modal and resetting states
  const handleClose = (onClose: () => void): void => {
    setAmountVal("");
    setName("");
    onClose();
  };

  // Handles authorizing a transaction
  // TODO: Refactor alerts to return descriptive toasts
  const handleAuthTransaction = async (onClose: () => void): Promise<void> => {
    const parsedAmount: number = parseFloat(amountVal);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert(
        "Invalid transaction amount! Please enter a valid number greater than 0",
      );
      return;
    }
    try {
      const res = await authTransaction({ amount: parsedAmount, name: name });
      alert(
        `Transaction authorized successfully! Your new available balance is: $${res.availableBalance}`,
      );
      handleClose(onClose);
    } catch (error) {
      if (error instanceof Error) {
        alert(`Transaction authorization failed: ${error.message}`);
      } else {
        alert(`Transaction authorization failed due to an unknown error`);
      }
    }
  };

  return (
    <>
      <Card className="max-w-[300px]">
        <CardHeader className="mb-0 flex gap-3">
          <div className="flex flex-col">
            <p className="text-sm font-normal text-gray-600">
              Available Balance
            </p>
          </div>
        </CardHeader>
        <CardBody className="pt-0">
          <h1 className="text-2xl font-medium">
            ${balanceData.availableBalance}
          </h1>
        </CardBody>
        <Divider></Divider>
        <CardFooter>
          <Button
            onPress={onOpen}
            radius="full"
            className="bg-gradient-to-tr from-pink-500 to-yellow-500 text-white shadow-lg"
          >
            Initiate Transaction
          </Button>
        </CardFooter>
      </Card>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} placement="top-center">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Authorize Transaction
              </ModalHeader>
              <ModalBody>
                <Input
                  autoFocus
                  label="Transaction Amount"
                  placeholder="Enter the dollar value of your transaction"
                  onChange={(e) => setAmountVal(e.currentTarget.value)}
                  variant="bordered"
                  isRequired={true}
                  startContent={
                    <div className="pointer-events-none flex items-center">
                      <span className="text-small text-default-400">$</span>
                    </div>
                  }
                />
                <Input
                  label="Name"
                  placeholder="Enter the name of your transaction"
                  onChange={(e) => setName(e.currentTarget.value)}
                  variant="bordered"
                />
              </ModalBody>
              <ModalFooter>
                <Button
                  color="danger"
                  variant="flat"
                  onPress={() => handleClose(onClose)}
                >
                  Cancel
                </Button>
                <Button
                  color="primary"
                  onPress={() => handleAuthTransaction(onClose)}
                >
                  Submit
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default AvailableBalance;
