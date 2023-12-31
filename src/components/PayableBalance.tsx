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
  Skeleton,
} from "@nextui-org/react";
import { api } from "~/utils/api";
import { Button } from "@nextui-org/react";
import { handleConfetti } from "~/utils/helpers";

const PayableBalance = () => {
  const { data: balanceData } = api.cardViews.getBalances.useQuery();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const ctx = api.useContext();

  const { mutateAsync: initiatePayment } =
    api.cardActions.initiatePayment.useMutation({
      onSuccess: () => {
        void ctx.cardViews.getBalances.invalidate();
        void ctx.cardViews.getTransactions.invalidate();
      },
    });

  const [payment, setPayment] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [submitLoading, setSubmitLoading] = useState<boolean>(false);
  const [invalid, setInvalid] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");

  // TODO: Refactor to return skeleton loading component
  if (!balanceData) {
    return <Skeleton></Skeleton>;
  }

  const handleOpenChange = (onOpenChange: () => void): void => {
    setPayment("");
    setName("");
    setInvalid(false);
    setErrorMsg("");
    onOpenChange();
  };

  // Handles closing the modal and resetting states
  const handleClose = (onClose: () => void): void => {
    setPayment("");
    setName("");
    setInvalid(false);
    setErrorMsg("");
    onClose();
  };

  // Handles verifying and initiating payment
  // TODO: Refactor alerts to return descriptive toasts + success confetti :)
  const handlePayment = async (onClose: () => void): Promise<void> => {
    const parsedPayment: number = parseFloat(payment);
    if (
      isNaN(parsedPayment) ||
      parsedPayment <= 0 ||
      parsedPayment > balanceData.payableBalance
    ) {
      setInvalid(true);
      setErrorMsg(
        `Please enter a valid number greater than 0 and less than ${balanceData.payableBalance}`,
      );
      return;
    }
    try {
      setSubmitLoading(true);
      await initiatePayment({ amount: parsedPayment, name: name });
      setSubmitLoading(false);
      handleConfetti();
      handleClose(onClose);
    } catch (error) {
      setSubmitLoading(false);
      setInvalid(true);
      if (error instanceof Error) {
        setErrorMsg(`Initiating payment failed: ${error.message}`);
      } else {
        setErrorMsg(`Initiating payment failed due to an unknown error`);
      }
    }
  };

  return (
    <>
      <Card className="max-w-[300px]">
        <CardHeader className="mb-0 flex gap-3">
          <div className="flex flex-col">
            <p className="text-sm font-normal text-gray-600">Payable Balance</p>
          </div>
        </CardHeader>
        <CardBody className="pt-0">
          <h1 className="text-2xl font-medium">
            ${balanceData.payableBalance}
          </h1>
        </CardBody>
        <Divider></Divider>
        <CardFooter className="flex-wrap gap-2">
          <Button
            onPress={onOpen}
            radius="full"
            className="bg-gradient-to-tr from-pink-500 to-yellow-500 text-white shadow-lg"
          >
            Pay Balance
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
                Initiate Payment
              </ModalHeader>
              <ModalBody>
                <Input
                  autoFocus
                  label="Payment Amount"
                  placeholder="Enter the dollar value of your payment"
                  onChange={(e) => setPayment(e.currentTarget.value)}
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
                  className="bg-gradient-to-tr from-red-500 to-pink-500 text-white shadow-lg"
                  onPress={() => handleClose(onClose)}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-gradient-to-tr from-green-400 to-green-500 text-white shadow-lg"
                  onPress={() => handlePayment(onClose)}
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

export default PayableBalance;
