import React, { useState } from "react";
import { Button } from "./ui/button";
import { useCreateCheckoutSessionMutation, useVerifyPaymentMutation } from "@/features/api/purchaseApi";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const BuyCourseButtonRazorpay = ({ courseId }) => {
  const [createCheckoutSession, { isLoading }] = useCreateCheckoutSessionMutation();
  const [verifyPayment, { isLoading: isVerifying }] = useVerifyPaymentMutation();
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };

  const purchaseCourseHandler = async () => {
    try {
      setIsProcessing(true);
      const response = await createCheckoutSession(courseId);
      
      if (response.data && response.data.success) {
        const razorpayLoaded = await loadRazorpay();
        
        if (!razorpayLoaded) {
          toast.error("Razorpay SDK failed to load. Check your connection.");
          setIsProcessing(false);
          return;
        }
        
        const options = {
          key: response.data.key_id,
          amount: response.data.amount,
          currency: "INR",
          name: "EduFlow LMS",
          description: response.data.description || "Course Purchase",
          order_id: response.data.order_id,
          handler: async function (paymentResponse) {
            try {
              // Handle the success callback
              const result = await verifyPayment({
                razorpay_payment_id: paymentResponse.razorpay_payment_id,
                razorpay_order_id: paymentResponse.razorpay_order_id,
                razorpay_signature: paymentResponse.razorpay_signature
              }).unwrap();
              
              if (result.success) {
                toast.success("Payment successful!");
                navigate(result.redirectUrl);
              } else {
                toast.error("Payment verification failed");
              }
            } catch (error) {
              toast.error("Error verifying payment");
              console.error("Verification error:", error);
            } finally {
              setIsProcessing(false);
            }
          },
          prefill: {
            name: response.data.name || "",
            email: response.data.email || "",
            contact: response.data.contact || ""
          },
          notes: {
            courseId: courseId
          },
          theme: {
            color: "#3399cc"
          },
          modal: {
            ondismiss: function() {
              setIsProcessing(false);
              toast.info("Payment cancelled");
            }
          }
        };
        
        const paymentObject = new window.Razorpay(options);
        paymentObject.on('payment.failed', function (response) {
          toast.error(`Payment failed: ${response.error.description}`);
          setIsProcessing(false);
        });
        paymentObject.open();
      } else {
        toast.error(response.error?.data?.message || "Failed to create checkout session");
        setIsProcessing(false);
      }
    } catch (err) {
      toast.error("Error initiating payment");
      console.error(err);
      setIsProcessing(false);
    }
  };

  // Determine if the button should be disabled
  const isButtonDisabled = isLoading || isVerifying || isProcessing;

  return (
    <Button
      disabled={isButtonDisabled}
      onClick={purchaseCourseHandler}
      className="w-full"
    >
      {isButtonDisabled ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Please wait
        </>
      ) : (
        "Purchase Course"
      )}
    </Button>
  );
};

export default BuyCourseButtonRazorpay; 