import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Divider,
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
import { handleConfetti } from "~/utils/helpers";

const AvailableBalance = () => {
  const { data: balanceData } = api.cardViews.getBalances.useQuery();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const ctx = api.useContext();
  const { mutateAsync: authTransaction } =
    api.cardActions.authorizeTransaction.useMutation({
      onSuccess: () => {
        void ctx.cardViews.getBalances.invalidate();
        void ctx.cardViews.getTransactions.invalidate();
      },
    });
  const [amountVal, setAmountVal] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [submitLoading, setSubmitLoading] = useState<boolean>(false);
  const [invalid, setInvalid] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");

  // TODO: Refactor to return skeleton loading component
  if (!balanceData) {
    return "Loading...";
  }

  // Handles resetting states when modal state changes
  const handleOpenChange = (onOpenChange: () => void): void => {
    setAmountVal("");
    setName("");
    setInvalid(false);
    setErrorMsg("");
    onOpenChange();
  };

  // Handles closing the modal and resetting states
  const handleClose = (onClose: () => void): void => {
    setAmountVal("");
    setName("");
    setInvalid(false);
    setErrorMsg("");
    onClose();
  };

  // Handles authorizing a transaction
  // TODO: Refactor alerts to return descriptive toasts
  const handleAuthTransaction = async (onClose: () => void): Promise<void> => {
    const parsedAmount: number = parseFloat(amountVal);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setInvalid(true);
      setErrorMsg("Please enter a valid number greater than 0!");
      // alert(
      //   "Invalid transaction amount! Please enter a valid number greater than 0",
      // );
      return;
    }
    try {
      setSubmitLoading(true);
      await authTransaction({ amount: parsedAmount, name: name });
      setSubmitLoading(false);
      handleConfetti();
      handleClose(onClose);
    } catch (error) {
      setSubmitLoading(false);
      setInvalid(true);
      if (error instanceof Error) {
        setErrorMsg(`Transaction authorization failed: ${error.message}`);
      } else {
        setErrorMsg(`Transaction authorization failed due to an unknown error`);
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
      <Modal
        isOpen={isOpen}
        onOpenChange={() => handleOpenChange(onOpenChange)}
        placement="top-center"
      >
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
                  isInvalid={invalid}
                  errorMessage={errorMsg}
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
                  isLoading={submitLoading}
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
