// ─────────────────────────────────────────────────────────────
// UseCase: WalletUseCase
// Agrupa operaciones sobre la cartera digital.
// ─────────────────────────────────────────────────────────────

import { Inject, Injectable } from '@nestjs/common';
import { v4 as uuidv4 }       from 'uuid';

import { Wallet }            from '../../domain/entities/Wallet';
import { WalletTransaction, TransactionType } from '../../domain/entities/WalletTransaction';
import * as repositories from '../../domain/ports/repositories';

@Injectable()
export class WalletUseCase {
  constructor(
    @Inject(repositories.WALLET_REPOSITORY)
    private readonly walletRepo: repositories.WalletRepository,

    @Inject(repositories.WALLET_TRANSACTION_REPOSITORY)
    private readonly txRepo: repositories.WalletTransactionRepository,
  ) {}

  /** Crea la cartera de un usuario (solo una por usuario) */
  async createWallet(userId: string): Promise<Wallet> {
    const existing = await this.walletRepo.findByUserId(userId);
    if (existing) throw new Error(`El usuario '${userId}' ya tiene una cartera registrada.`);
    const wallet = Wallet.create(userId, uuidv4());
    await this.walletRepo.save(wallet);
    return wallet;
  }

  /** Consulta la cartera por userId */
  async getWalletByUser(userId: string): Promise<Wallet> {
    const wallet = await this.walletRepo.findByUserId(userId);
    if (!wallet) throw new Error(`No se encontró cartera para el usuario '${userId}'.`);
    return wallet;
  }

  /** Consulta la cartera por su ID */
  async getWalletById(id: string): Promise<Wallet> {
    const wallet = await this.walletRepo.findById(id);
    if (!wallet) throw new Error(`Cartera con id '${id}' no encontrada.`);
    return wallet;
  }

  /** Recarga saldo en la cartera */
  async recharge(userId: string, amount: number, description: string | null): Promise<Wallet> {
    const wallet = await this.getWalletByUser(userId);
    wallet.recharge(amount);
    await this.walletRepo.update(wallet);

    const tx = WalletTransaction.create(wallet.id, TransactionType.RECARGA, amount, uuidv4(), description);
    await this.txRepo.save(tx);

    return wallet;
  }

  /** Débito interno (usado por el servicio de pagos) */
  async debit(userId: string, amount: number, description: string | null): Promise<Wallet> {
    const wallet = await this.getWalletByUser(userId);
    wallet.debit(amount);
    await this.walletRepo.update(wallet);

    const tx = WalletTransaction.create(wallet.id, TransactionType.PAGO, amount, uuidv4(), description);
    await this.txRepo.save(tx);

    return wallet;
  }

  /** Reembolso a la cartera */
  async refundToWallet(userId: string, amount: number, description: string | null): Promise<Wallet> {
    const wallet = await this.getWalletByUser(userId);
    wallet.refund(amount);
    await this.walletRepo.update(wallet);

    const tx = WalletTransaction.create(wallet.id, TransactionType.REEMBOLSO, amount, uuidv4(), description);
    await this.txRepo.save(tx);

    return wallet;
  }

  /** Lista las transacciones de una cartera */
  async listTransactions(
    walletId: string,
    page: number,
    limit: number,
  ): Promise<repositories.PaginatedResult<WalletTransaction>> {
    const wallet = await this.walletRepo.findById(walletId);
    if (!wallet) throw new Error(`Cartera con id '${walletId}' no encontrada.`);
    return this.txRepo.findByWalletId(walletId, page, limit);
  }
}
