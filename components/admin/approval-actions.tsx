"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { CheckCircle, XCircle } from "lucide-react"
import { useRouter } from "next/navigation"

interface ApprovalActionsProps {
  requestId: string
  userId: string
}

export function ApprovalActions({ requestId, userId }: ApprovalActionsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [notes, setNotes] = useState("")
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const router = useRouter()

  const handleApprove = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/admin/approve-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, userId, action: "approve" }),
      })

      if (response.ok) {
        router.refresh()
      } else {
        console.error("Failed to approve user")
      }
    } catch (error) {
      console.error("Error approving user:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleReject = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/admin/approve-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId,
          userId,
          action: "reject",
          notes: notes.trim() || undefined,
        }),
      })

      if (response.ok) {
        setShowRejectDialog(false)
        setNotes("")
        router.refresh()
      } else {
        console.error("Failed to reject user")
      }
    } catch (error) {
      console.error("Error rejecting user:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex gap-2">
      <Button onClick={handleApprove} disabled={isLoading} size="sm" className="bg-green-600 hover:bg-green-700">
        <CheckCircle className="h-4 w-4 mr-1" />
        Aprovar
      </Button>

      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogTrigger asChild>
          <Button variant="destructive" size="sm" disabled={isLoading}>
            <XCircle className="h-4 w-4 mr-1" />
            Rejeitar
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeitar Solicitação</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja rejeitar esta solicitação? Você pode adicionar uma observação explicando o motivo.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="notes">Observações (opcional)</Label>
              <Textarea
                id="notes"
                placeholder="Motivo da rejeição..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-1"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowRejectDialog(false)} disabled={isLoading}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={handleReject} disabled={isLoading}>
                {isLoading ? "Rejeitando..." : "Confirmar Rejeição"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
